from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..services.ai_service import generate_interview_question, evaluate_interview_answer

router = APIRouter()

@router.post("/start", response_model=schemas.InterviewResponse)
def start_interview(
    request: schemas.InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get the resume analysis
    resume = db.query(models.Resume).filter(models.Resume.id == request.resume_id, models.Resume.user_id == current_user.id).first()
    if not resume or not resume.analysis:
        raise HTTPException(status_code=404, detail="Resume analysis not found")

    # Create new interview session
    new_interview = models.Interview(
        user_id=current_user.id,
        resume_id=request.resume_id,
        target_role=request.target_role
    )
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    # Convert resume analysis to dict context
    import json
    resume_context = {
        "summary": resume.analysis.summary,
        "skills": json.loads(resume.analysis.skills) if resume.analysis.skills else []
    }

    # Generate first question
    question_data = generate_interview_question(
        resume_context=resume_context,
        previous_qa=[],
        difficulty="medium",
        category="technical",
        target_role=request.target_role
    )

    new_question = models.InterviewQuestion(
        interview_id=new_interview.id,
        question_text=question_data.get("question_text", "Can you walk me through your resume?"),
        category="technical",
        difficulty="medium",
        skill_tag=question_data.get("skill_tag", "General"),
        order_index=1
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_interview) # Refresh to get the question relationship

    return new_interview

@router.post("/{interview_id}/question/{question_id}/answer", response_model=schemas.InterviewAnswerResponse)
def answer_question(
    interview_id: int,
    question_id: int,
    request: schemas.InterviewAnswerRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify ownership and state
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id, models.Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    question = db.query(models.InterviewQuestion).filter(models.InterviewQuestion.id == question_id, models.InterviewQuestion.interview_id == interview_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    if question.answer:
        raise HTTPException(status_code=400, detail="Question already answered")

    # Record the answer
    answer = models.InterviewAnswer(
        question_id=question_id,
        answer_text=request.answer_text
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)

    # Evaluate the answer
    evaluation_data = evaluate_interview_answer(
        question_text=question.question_text,
        answer_text=request.answer_text,
        target_role=interview.target_role,
        difficulty=question.difficulty
    )

    import json

    evaluation = models.InterviewEvaluation(
        answer_id=answer.id,
        score=evaluation_data.get("score", 50.0),
        strengths=json.dumps(evaluation_data.get("strengths", [])),
        weaknesses=json.dumps(evaluation_data.get("weaknesses", [])),
        suggestions=json.dumps(evaluation_data.get("suggestions", [])),
        ideal_answer=evaluation_data.get("ideal_answer", "")
    )
    db.add(evaluation)
    db.commit()
    db.refresh(answer) # Fetch evaluation relationship

    # Decide next steps (max 5 questions for now)
    total_questions = db.query(models.InterviewQuestion).filter(models.InterviewQuestion.interview_id == interview_id).count()
    
    if total_questions >= 5:
        interview.status = "completed"
        # Calculate final score
        all_evals = db.query(models.InterviewEvaluation).join(models.InterviewAnswer).join(models.InterviewQuestion).filter(models.InterviewQuestion.interview_id == interview_id).all()
        if all_evals:
            avg_score = sum([e.score for e in all_evals]) / len(all_evals)
            interview.final_score = avg_score
        db.commit()
    else:
        # Generate next question based on score
        next_difficulty = "medium"
        if evaluation.score > 80:
            next_difficulty = "hard"
        elif evaluation.score < 50:
            next_difficulty = "easy"
            
        next_category = ["technical", "behavioral", "project", "problem_solving"][total_questions % 4]
        
        # Build history for context
        history = []
        for q in db.query(models.InterviewQuestion).filter(models.InterviewQuestion.interview_id == interview_id).order_by(models.InterviewQuestion.order_index).all():
            if q.answer:
                history.append({
                    "question": q.question_text,
                    "answer": q.answer.answer_text
                })
                
        resume = db.query(models.Resume).filter(models.Resume.id == interview.resume_id).first()
        resume_context = {
            "summary": resume.analysis.summary if resume.analysis else "",
            "skills": json.loads(resume.analysis.skills) if resume.analysis and resume.analysis.skills else []
        }
        
        next_q_data = generate_interview_question(
            resume_context=resume_context,
            previous_qa=history,
            difficulty=next_difficulty,
            category=next_category,
            target_role=interview.target_role
        )
        
        new_question = models.InterviewQuestion(
            interview_id=interview_id,
            question_text=next_q_data.get("question_text", "Can you explain that further?"),
            category=next_category,
            difficulty=next_difficulty,
            skill_tag=next_q_data.get("skill_tag", "General"),
            order_index=total_questions + 1
        )
        db.add(new_question)
        db.commit()

    # Format the lists properly for the response
    # SQLAlchemy mapped relationships do this automatically via pydantic if structured right,
    # but since strengths/weaknesses/suggestions are JSON strings in DB, we need to deserialize.
    # The Pydantic schema expects Lists. Let's patch the response object dynamically or fix the schema mapping.
    
    # Returning dict instead of ORM object to handle JSON strings properly
    return {
        "id": answer.id,
        "answer_text": answer.answer_text,
        "evaluation": {
            "id": evaluation.id,
            "score": evaluation.score,
            "strengths": json.loads(evaluation.strengths),
            "weaknesses": json.loads(evaluation.weaknesses),
            "suggestions": json.loads(evaluation.suggestions),
            "ideal_answer": evaluation.ideal_answer
        } if evaluation else None
    }

@router.get("/history", response_model=List[schemas.InterviewResponse])
def get_interviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    interviews = db.query(models.Interview).filter(models.Interview.user_id == current_user.id).order_by(models.Interview.created_at.desc()).all()
    # Need to handle nested JSON lists...
    
    # Quick utility to convert JSON string arrays to lists for Pydantic
    import json
    result = []
    for iv in interviews:
        iv_dict = {
            "id": iv.id,
            "user_id": iv.user_id,
            "resume_id": iv.resume_id,
            "target_role": iv.target_role,
            "status": iv.status,
            "final_score": iv.final_score,
            "created_at": iv.created_at,
            "questions": []
        }
        for q in iv.questions:
            q_dict = {
                "id": q.id,
                "question_text": q.question_text,
                "category": q.category,
                "difficulty": q.difficulty,
                "skill_tag": q.skill_tag,
                "order_index": q.order_index,
                "answer": None
            }
            if q.answer:
                q_dict["answer"] = {
                    "id": q.answer.id,
                    "answer_text": q.answer.answer_text,
                    "evaluation": None
                }
                if q.answer.evaluation:
                    q_dict["answer"]["evaluation"] = {
                        "id": q.answer.evaluation.id,
                        "score": q.answer.evaluation.score,
                        "strengths": json.loads(q.answer.evaluation.strengths) if q.answer.evaluation.strengths else [],
                        "weaknesses": json.loads(q.answer.evaluation.weaknesses) if q.answer.evaluation.weaknesses else [],
                        "suggestions": json.loads(q.answer.evaluation.suggestions) if q.answer.evaluation.suggestions else [],
                        "ideal_answer": q.answer.evaluation.ideal_answer
                    }
            iv_dict["questions"].append(q_dict)
        result.append(iv_dict)
    
    return result

@router.get("/{interview_id}", response_model=schemas.InterviewResponse)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    iv = db.query(models.Interview).filter(models.Interview.id == interview_id, models.Interview.user_id == current_user.id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    import json
    iv_dict = {
        "id": iv.id,
        "user_id": iv.user_id,
        "resume_id": iv.resume_id,
        "target_role": iv.target_role,
        "status": iv.status,
        "final_score": iv.final_score,
        "created_at": iv.created_at,
        "questions": []
    }
    for q in sorted(iv.questions, key=lambda x: x.order_index):
        q_dict = {
            "id": q.id,
            "question_text": q.question_text,
            "category": q.category,
            "difficulty": q.difficulty,
            "skill_tag": q.skill_tag,
            "order_index": q.order_index,
            "answer": None
        }
        if q.answer:
            q_dict["answer"] = {
                "id": q.answer.id,
                "answer_text": q.answer.answer_text,
                "evaluation": None
            }
            if q.answer.evaluation:
                q_dict["answer"]["evaluation"] = {
                    "id": q.answer.evaluation.id,
                    "score": q.answer.evaluation.score,
                    "strengths": json.loads(q.answer.evaluation.strengths) if q.answer.evaluation.strengths else [],
                    "weaknesses": json.loads(q.answer.evaluation.weaknesses) if q.answer.evaluation.weaknesses else [],
                    "suggestions": json.loads(q.answer.evaluation.suggestions) if q.answer.evaluation.suggestions else [],
                    "ideal_answer": q.answer.evaluation.ideal_answer
                }
        iv_dict["questions"].append(q_dict)
        
    return iv_dict
