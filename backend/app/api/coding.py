from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..services.ai_service import generate_coding_question, evaluate_code_quality
from ..services.coding_service import execute_code

router = APIRouter()

@router.post("/start", response_model=schemas.CodingRoundResponse)
def start_coding_round(
    request: schemas.CodingStartRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == request.resume_id, models.Resume.user_id == current_user.id).first()
    if not resume or not resume.analysis:
        raise HTTPException(status_code=404, detail="Resume analysis not found")

    new_round = models.CodingRound(
        user_id=current_user.id,
        resume_id=request.resume_id,
        target_role=request.target_role,
        difficulty=request.difficulty
    )
    db.add(new_round)
    db.commit()
    db.refresh(new_round)

    resume_context = {
        "summary": resume.analysis.summary,
        "skills": eval(resume.analysis.skills) if resume.analysis.skills else []
    }

    q_data = generate_coding_question(resume_context, request.target_role, request.difficulty)

    new_question = models.CodingQuestion(
        round_id=new_round.id,
        title=q_data.get("title", "Problem"),
        problem_statement=q_data.get("problem_statement", ""),
        topic_tag=q_data.get("topic_tag", "General"),
        difficulty=request.difficulty,
        constraints=json.dumps(q_data.get("constraints", [])),
        examples=json.dumps(q_data.get("examples", [])),
        visible_test_cases=json.dumps(q_data.get("visible_test_cases", [])),
        hidden_test_cases=json.dumps(q_data.get("hidden_test_cases", [])),
        hints=json.dumps(q_data.get("hints", []))
    )
    db.add(new_question)
    db.commit()
    
    # Reload with relationships mapped correctly as Dict for Pydantic to parse properly
    
    return {
        "id": new_round.id,
        "user_id": new_round.user_id,
        "resume_id": new_round.resume_id,
        "target_role": new_round.target_role,
        "difficulty": new_round.difficulty,
        "status": new_round.status,
        "final_score": new_round.final_score,
        "created_at": new_round.created_at,
        "questions": [{
            "id": new_question.id,
            "title": new_question.title,
            "problem_statement": new_question.problem_statement,
            "topic_tag": new_question.topic_tag,
            "difficulty": new_question.difficulty,
            "constraints": json.loads(new_question.constraints),
            "examples": json.loads(new_question.examples),
            "visible_test_cases": json.loads(new_question.visible_test_cases),
            "hints": json.loads(new_question.hints),
            "submissions": []
        }]
    }

@router.post("/question/{question_id}/submit", response_model=schemas.CodingSubmissionResponse)
def submit_code(
    question_id: int,
    request: schemas.CodingSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    question = db.query(models.CodingQuestion).filter(models.CodingQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    coding_round = db.query(models.CodingRound).filter(models.CodingRound.id == question.round_id, models.CodingRound.user_id == current_user.id).first()
    if not coding_round:
        raise HTTPException(status_code=403, detail="Unauthorized access to question")

    hidden_cases = json.loads(question.hidden_test_cases)
    visible_cases = json.loads(question.visible_test_cases)
    all_cases = visible_cases + hidden_cases

    # Run code against piston API
    exec_result = execute_code(request.language, request.code, all_cases)

    # Save Submission
    submission = models.CodingSubmission(
        question_id=question_id,
        language=request.language,
        code=request.code,
        status=exec_result["status"],
        passed_cases=exec_result["passed_cases"],
        total_cases=exec_result["total_cases"],
        execution_time_ms=exec_result["execution_time_ms"],
        memory_kb=exec_result["memory_kb"]
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Trigger AI Review
    eval_data = evaluate_code_quality(request.code, request.language, question.problem_statement)

    review = models.CodingReview(
        submission_id=submission.id,
        score=eval_data.get("score", 0),
        time_complexity=eval_data.get("time_complexity", ""),
        space_complexity=eval_data.get("space_complexity", ""),
        correctness=eval_data.get("correctness", ""),
        code_quality=eval_data.get("code_quality", ""),
        optimization_suggestions=json.dumps(eval_data.get("optimization_suggestions", [])),
        security_issues=json.dumps(eval_data.get("security_issues", [])),
        alternative_solution=eval_data.get("alternative_solution", "")
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Mark round as completed
    coding_round.status = "completed"
    coding_round.final_score = review.score
    db.commit()

    return {
        "id": submission.id,
        "language": submission.language,
        "code": submission.code,
        "status": submission.status,
        "passed_cases": submission.passed_cases,
        "total_cases": submission.total_cases,
        "execution_time_ms": submission.execution_time_ms,
        "memory_kb": submission.memory_kb,
        "created_at": submission.created_at,
        "first_failed": exec_result.get("first_failed"),
        "review": {
            "id": review.id,
            "score": review.score,
            "time_complexity": review.time_complexity,
            "space_complexity": review.space_complexity,
            "correctness": review.correctness,
            "code_quality": review.code_quality,
            "optimization_suggestions": json.loads(review.optimization_suggestions),
            "security_issues": json.loads(review.security_issues),
            "alternative_solution": review.alternative_solution
        }
    }

@router.post("/run")
def run_code(
    request: schemas.CodingSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    from ..services.coding_service import execute_run_code
    
    # Run code against execution engine without test cases
    exec_result = execute_run_code(request.language, request.code)

    return {
        "stdout": exec_result["stdout"],
        "stderr": exec_result["stderr"],
        "runtime": exec_result["runtime"],
        "memory": exec_result["memory"],
        "success": exec_result["success"]
    }
