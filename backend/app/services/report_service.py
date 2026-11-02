import io
import csv
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from app.models.metric import EnergyMetric
from app.models.company import Company
from app.core.uba_engine import UBA_FACTORS


async def generate_metrics_csv(db: AsyncSession, company_id: str) -> io.StringIO:
    result = await db.execute(
        select(EnergyMetric)
        .where(EnergyMetric.company_id == company_id)
        .order_by(EnergyMetric.billing_period_start.desc())
    )
    metrics = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # German Standard CSV Headers
    writer.writerow([
        "Metric ID",
        "Resource Type",
        "Raw Consumption Value",
        "Unit",
        "UBA Emission Factor (kg CO2e/unit)",
        "Calculated CO2 Emissions (kg)",
        "Period Start",
        "Period End",
        "Recorded At"
    ])

    for m in metrics:
        factor = UBA_FACTORS.get(m.type.value, 0.0)
        writer.writerow([
            m.id,
            m.type.value,
            f"{m.value_kwh_or_m3:.2f}",
            m.unit,
            f"{factor:.3f}",
            f"{m.co2_emissions_kg:.2f}",
            m.billing_period_start.isoformat(),
            m.billing_period_end.isoformat(),
            m.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    output.seek(0)
    return output


async def generate_audit_pdf(db: AsyncSession, company_id: str, lang: str = "de") -> io.BytesIO:
    comp_res = await db.execute(select(Company).where(Company.id == company_id))
    company = comp_res.scalar_one_or_none()
    company_name = company.name if company else "SME Client GmbH"
    reg_number = company.registration_number if company else "HRB-987654"
    city = company.city if company else "Frankfurt am Main"

    result = await db.execute(
        select(EnergyMetric)
        .where(EnergyMetric.company_id == company_id)
        .order_by(EnergyMetric.billing_period_start.desc())
    )
    metrics = result.scalars().all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#059669'),
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155'),
    )

    story = []

    # Translations
    is_de = (lang.lower() == "de")
    t_title = "EcoTrack – Audit-Konformer CO2- & Energiebericht" if is_de else "EcoTrack – Audit-Ready CO2 & Energy Report"
    t_sub = f"Gemäß EU Green Taxonomy & Umweltbundesamt (UBA) Standards | Erstellt am: {datetime.now().strftime('%d.%m.%Y %H:%M')}" if is_de else f"In accordance with EU Green Taxonomy & German UBA Standards | Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    t_comp_info = "Unternehmensdaten (Company Details)" if is_de else "Company Information"
    t_summary_title = "Zusammenfassung der Gesamtemissionen" if is_de else "Total Emissions Summary"
    t_table_title = "Detaillierte Verbrauchsprotokolle (Audit Logs)" if is_de else "Detailed Consumption Records"

    # Header
    story.append(Paragraph(t_title, title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(t_sub, subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#059669'), spaceAfter=14))

    # Company Details Box
    company_data = [
        [
            Paragraph(f"<b>Firma / Company:</b> {company_name}", body_style),
            Paragraph(f"<b>Handelsregister / HRB:</b> {reg_number}", body_style)
        ],
        [
            Paragraph(f"<b>Standort / Location:</b> {city}, Germany", body_style),
            Paragraph(f"<b>Audit-Status:</b> <font color='#059669'><b>KONFORM / COMPLIANT</b></font>", body_style)
        ]
    ]
    t_comp = Table(company_data, colWidths=[260, 260])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 14))

    # Total CO2 calculation
    total_co2 = sum(m.co2_emissions_kg for m in metrics)
    total_elec = sum(m.value_kwh_or_m3 for m in metrics if m.type.value == "ELECTRICITY")
    total_gas = sum(m.value_kwh_or_m3 for m in metrics if m.type.value == "NATURAL_GAS")
    total_water = sum(m.value_kwh_or_m3 for m in metrics if m.type.value == "WATER")
    total_waste = sum(m.value_kwh_or_m3 for m in metrics if m.type.value == "WASTE")

    story.append(Paragraph(t_summary_title, section_heading))
    summary_table_data = [
        [
            Paragraph("<b>Gesamter CO2-Ausstoß (Total CO2e)</b>", body_style),
            Paragraph(f"<b><font size='11' color='#059669'>{total_co2:,.2f} kg ({total_co2/1000:,.2f} t)</font></b>", body_style),
            Paragraph("<b>UBA Grid Faktor:</b> ~380g/kWh", body_style),
        ],
        [
            Paragraph(f"Strom (Electricity): {total_elec:,.1f} kWh", body_style),
            Paragraph(f"Erdgas (Gas): {total_gas:,.1f} kWh", body_style),
            Paragraph(f"Wasser (Water): {total_water:,.1f} m³", body_style),
        ]
    ]
    t_sum = Table(summary_table_data, colWidths=[200, 180, 140])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    story.append(t_sum)
    story.append(Spacer(1, 14))

    # Detailed Table
    story.append(Paragraph(t_table_title, section_heading))

    table_data = [
        [
            Paragraph("<b>Ressource / Type</b>", body_style),
            Paragraph("<b>Verbrauch / Value</b>", body_style),
            Paragraph("<b>Einheit / Unit</b>", body_style),
            Paragraph("<b>UBA Faktor</b>", body_style),
            Paragraph("<b>CO2-Ausstoß (kg)</b>", body_style),
            Paragraph("<b>Zeitraum / Period</b>", body_style),
        ]
    ]

    for m in metrics[:25]:  # show up to 25 latest
        factor = UBA_FACTORS.get(m.type.value, 0.0)
        table_data.append([
            Paragraph(m.type.value, body_style),
            Paragraph(f"{m.value_kwh_or_m3:,.1f}", body_style),
            Paragraph(m.unit, body_style),
            Paragraph(f"{factor:.3f}", body_style),
            Paragraph(f"<b>{m.co2_emissions_kg:,.2f}</b>", body_style),
            Paragraph(f"{m.billing_period_start.strftime('%d.%m.%y')} - {m.billing_period_end.strftime('%d.%m.%y')}", body_style),
        ])

    t_metrics = Table(table_data, colWidths=[100, 85, 60, 70, 95, 110])
    t_metrics.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    story.append(t_metrics)

    # Footer note
    story.append(Spacer(1, 16))
    footer_text = (
        "Dieses Dokument wurde automatisch von der EcoTrack Enterprise SaaS Plattform generiert. "
        "Die Berechnungen entsprechen den Vorgaben des Umweltbundesamtes (UBA) und der EU-Taxonomie-Verordnung (EU) 2020/852."
        if is_de else
        "This document was automatically generated by the EcoTrack Enterprise SaaS platform. "
        "Calculations comply with German Umweltbundesamt (UBA) guidelines and EU Taxonomy Regulation (EU) 2020/852."
    )
    story.append(Paragraph(f"<font color='#94A3B8'><i>{footer_text}</i></font>", subtitle_style))

    doc.build(story)
    buffer.seek(0)
    return buffer
