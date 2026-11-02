from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.report_service import generate_audit_pdf, generate_metrics_csv

router = APIRouter(prefix="/reports", tags=["Compliance & Export Reports"])


@router.get("/export/pdf", summary="Export audit-ready PDF report (German/English)")
async def export_pdf(
    lang: str = Query("de", regex="^(de|en)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pdf_buffer = await generate_audit_pdf(db, company_id=current_user.company_id, lang=lang)
    filename = f"ecotrack_audit_report_{lang.upper()}.pdf"
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/export/csv", summary="Export raw metrics as CSV for ERP integration")
async def export_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    csv_buffer = await generate_metrics_csv(db, company_id=current_user.company_id)
    filename = "ecotrack_metrics_export.csv"

    return Response(
        content=csv_buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
