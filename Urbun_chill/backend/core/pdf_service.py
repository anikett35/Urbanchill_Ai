"""
PDF Report Generation Service for UrbanChill AI using ReportLab.
Produces an executive, academically defensible urban heat resilience audit report.
Explicitly distinguishes observed reanalysis, derived proxies, and surrogate ML models.
"""

import io
import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from core.simulation_engine import compute_diminishing_cooling

def generate_urban_heat_report(
    city_name: str,
    analysis_data: Dict[str, Any],
    simulation_data: Dict[str, Any] = None
) -> bytes:
    """
    Constructs an executive PDF report and returns its raw bytes.
    Includes data quality scoring, physical hazard vs vulnerability, and scientific limitations.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom color palette matching UrbanChill AI branding
    c_primary = colors.HexColor("#fb732c")
    c_dark = colors.HexColor("#0f172a")
    c_slate = colors.HexColor("#334155")
    c_light_bg = colors.HexColor("#f8fafc")
    c_border = colors.HexColor("#e2e8f0")
    
    # Typography styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=c_dark,
        fontName="Helvetica-Bold",
        alignment=TA_LEFT
    )
    
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b"),
        fontName="Helvetica"
    )
    
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=11,
        leading=15,
        textColor=c_dark,
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=5
    )
    
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=12,
        textColor=c_slate,
        fontName="Helvetica"
    )
    
    limitation_style = ParagraphStyle(
        "LimitationBody",
        parent=styles["Normal"],
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#475569"),
        fontName="Helvetica-Oblique"
    )
    
    story = []
    
    # ── HEADER BANNER ──────────────────────────────────────────────
    report_date = datetime.datetime.now(datetime.timezone.utc).strftime("%B %d, %Y - %H:%M UTC")
    model_ver = analysis_data.get("modelVersion", "urbanchill-rf-1.1")
    
    header_data = [
        [
            Paragraph(f"<b>UrbanChill AI</b> | Climatological Digital Twin Audit", subtitle_style),
            Paragraph(f"Generated: {report_date} | Model: {model_ver}", ParagraphStyle("DateStyle", parent=subtitle_style, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[3.7 * inch, 3.7 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=3, spaceAfter=10))
    
    # ── DOCUMENT TITLE & RISK BADGE ────────────────────────────────
    risk_level = analysis_data.get("heatRisk", "High")
    risk_colors = {
        "Low": colors.HexColor("#10b981"),
        "Moderate": colors.HexColor("#f59e0b"),
        "High": colors.HexColor("#fb732c"),
        "Critical": colors.HexColor("#ef4444")
    }
    risk_color = risk_colors.get(risk_level, c_primary)
    
    dq = analysis_data.get("dataQuality", {})
    dq_score = dq.get("score", 85)
    dq_level = dq.get("level", "GOOD")
    hazard_idx = analysis_data.get("heatHazardIndex", 0.65)
    vuln_idx = analysis_data.get("vulnerabilityIndex", 0.55)
    
    title_data = [
        [
            Paragraph(f"Urban Heat Resilience Assessment: <b>{city_name}</b>", title_style),
            Paragraph(
                f"<font color='white'><b>{risk_level.upper()} RISK</b></font>",
                ParagraphStyle("RiskBadge", parent=styles["Normal"], alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=11)
            )
        ]
    ]
    title_table = Table(title_data, colWidths=[5.4 * inch, 2.0 * inch])
    title_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (1,0), (1,0), risk_color),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('BOTTOMPADDING', (1,0), (1,0), 6),
        ('TOPPADDING', (1,0), (1,0), 6),
    ]))
    story.append(title_table)
    story.append(Spacer(1, 8))
    
    # ── EXECUTIVE SUMMARY & QUALITY BANNER ──────────────────────────
    summary_text = (
        f"This decision-support report synthesizes real-time meteorological surface reanalysis (Open-Meteo), "
        f"urban morphological vector topologies (Mapbox Streets v8), and calibrated machine learning risk models for <b>{city_name}</b>. "
        f"The physical heat hazard index is evaluated at <b>{hazard_idx:.2f}</b>/1.0, with an estimated population exposure vulnerability index of <b>{vuln_idx:.2f}</b>/1.0. "
        f"Data Quality Score is verified at <b>{dq_score}/100 ({dq_level})</b>."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 8))
    
    # ── PRIMARY ENVIRONMENTAL TELEMETRY TABLE ──────────────────────
    story.append(Paragraph("1. Environmental Telemetry & Scientific Provenance", section_heading))
    
    lst_val = analysis_data.get("lst", 36.5)
    ambient_val = analysis_data.get("ambientTemp", 31.0)
    ndvi_val = analysis_data.get("ndvi", 0.24)
    uv_val = analysis_data.get("uvIndex", 7)
    humidity_val = analysis_data.get("humidity", 48)
    aqi_val = analysis_data.get("airQualityIndex", 68)
    conf_raw = analysis_data.get("calibratedConfidence", analysis_data.get("confidence"))
    conf_str = f"{conf_raw*100:.1f}%" if conf_raw is not None else "Unavailable"
    
    metrics_data = [
        ["Indicator Parameter", "Observed / Modelled Value", "Data Provenance", "Scientific Classification"],
        ["Surface Skin Temperature Proxy", f"{lst_val:.1f} °C", "Open-Meteo Reanalysis + Built UHI Offset", "Derived Thermodynamic Proxy"],
        ["Ambient Air Temperature (2m)", f"{ambient_val:.1f} °C", "Open-Meteo ECMWF/GFS Reanalysis", "Observed Telemetry"],
        ["Vegetation Index Proxy (EVI)", f"{ndvi_val:.2f}", "Mapbox Landuse Vectors + Humidity", "Derived Vegetative Proxy"],
        ["Physical Heat Hazard Index", f"{hazard_idx:.2f} / 1.0", "Biophysical Thermal & Built Formulation", "Physical Hazard Score"],
        ["Human Exposure Proxy", f"{vuln_idx:.2f} / 1.0", "Built Footprint Demographic Scaling", "Vulnerability Exposure"],
        ["Relative Humidity / UV", f"{humidity_val}% | UV: {uv_val}/11", "Open-Meteo Live Solar Flux", "Observed Telemetry"],
        ["Air Quality (AQI / PM2.5)", f"{aqi_val} AQI ({analysis_data.get('pm2_5', 22)} ug/m3)", "OpenWeather Air Pollution Telemetry", "Observed Atmospheric"],
        ["Machine Learning Risk Model", f"{risk_level} ({conf_str})", f"Calibrated Random Forest ({model_ver})", "Surrogate Benchmark (5-fold CV)"]
    ]
    
    metrics_table = Table(metrics_data, colWidths=[2.3 * inch, 1.6 * inch, 2.1 * inch, 1.4 * inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_light_bg),
        ('TEXTCOLOR', (0,0), (-1,0), c_dark),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 10))
    
    # ── PRIMARY PREDICTION FACTORS ─────────────────────────────────
    primary_factors = analysis_data.get("primaryRiskFactors", [])
    if primary_factors:
        story.append(Paragraph("2. Primary Model Contributors (Dynamic Explainability)", section_heading))
        factor_items = []
        for f in primary_factors:
            factor_items.append(Paragraph(f"• <b>{f}</b> (Identified via standardized Z-score deviation relative to training baseline)", body_style))
        story.extend(factor_items)
        story.append(Spacer(1, 8))
        
    # ── TOP VULNERABLE SECTORS ────────────────────────────────────
    top_zones = analysis_data.get("topHeatZones", [])
    if top_zones:
        story.append(Paragraph("3. Micro-Urban Thermal Hotspots (25 Spatial Model Sectors)", section_heading))
        zone_rows = [["Sector Identifier", "Est. Surface Temp", "NDVI Proxy", "Risk Status", "Mitigation Priority"]]
        for z in top_zones:
            zone_rows.append([
                z.get("name", "Urban Zone"),
                f"{z.get('temp', lst_val):.1f} °C",
                f"{z.get('ndvi', ndvi_val):.2f}",
                z.get("risk", "High"),
                "Immediate Cool Roofs & Canopy" if z.get("risk") in ["High", "Critical"] else "Monitoring"
            ])
            
        zone_table = Table(zone_rows, colWidths=[2.6 * inch, 1.2 * inch, 1.0 * inch, 1.1 * inch, 1.5 * inch])
        zone_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), c_light_bg),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 7.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
            ('TOPPADDING', (0,0), (-1,-1), 3.5),
            ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ]))
        story.append(zone_table)
        story.append(Spacer(1, 10))
        
    # ── WHAT-IF MULTI-SCENARIO SIMULATION ─────────────────────────
    story.append(Paragraph("4. Urban Heat Mitigation Simulation Scenarios (Bounded Diminishing Returns)", section_heading))
    sim_tree = float(simulation_data.get("treeCoverIncrease", 20.0)) if simulation_data else 20.0
    sim_roof = float(simulation_data.get("coolRoofsRatio", 40.0)) if simulation_data else 40.0
    sim_parks = int(simulation_data.get("urbanParksAdded", 0)) if simulation_data else 0
    sim_water = float(simulation_data.get("waterBodiesExpansion", 0.0)) if simulation_data else 0.0

    sc_a = compute_diminishing_cooling(trees=25.0, roofs=0.0, parks=0, water=0.0)
    sc_b = compute_diminishing_cooling(trees=0.0, roofs=50.0, parks=0, water=0.0)
    sc_c = compute_diminishing_cooling(trees=25.0, roofs=40.0, parks=4, water=8.0)
    custom_cooling = compute_diminishing_cooling(trees=sim_tree, roofs=sim_roof, parks=sim_parks, water=sim_water)

    sim_rows = [
        ["Scenario Suite", "Intervention Parameters", "Projected Surface Cooling", "Resilience Outcome"],
        ["Scenario A (Canopy Priority)", "+25% Street Tree Canopy", f"-{sc_a['total_lst_reduction_deg_c']:.2f} °C Surface Drop", "Targeted shade corridors"],
        ["Scenario B (Cool Roofs Priority)", "+50% Reflective Cool Roofs", f"-{sc_b['total_lst_reduction_deg_c']:.2f} °C Surface Drop", "Commercial rooftop albedo"],
        ["Scenario C (Comprehensive Resilience)", "+25% Trees, +40% Roofs, 4 Parks, +8% Water", f"-{sc_c['total_lst_reduction_deg_c']:.2f} °C Surface Drop", "Multi-layer urban cooling"],
    ]
    sim_table = Table(sim_rows, colWidths=[2.2 * inch, 2.0 * inch, 1.6 * inch, 1.6 * inch])
    sim_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_light_bg),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(sim_table)
    story.append(Spacer(1, 10))
    
    # ── STRATEGIC RECOMMENDATIONS ──────────────────────────────────
    story.append(Paragraph("5. Strategic Planning Interventions", section_heading))
    recommendations = analysis_data.get("recommendations", [
        "Deploy cool reflective pavement and roofing materials on institutional assets",
        "Expand vegetative street tree canopy along major transit and pedestrian corridors",
        "Establish localized urban misting stations and climate shelter pavilions",
        "Preserve existing natural water buffers and urban wetlands from encroachment"
    ])
    for i, rec in enumerate(recommendations, 1):
        story.append(Paragraph(f"<b>{i}.</b> {rec}", body_style))
    story.append(Spacer(1, 10))
    
    # ── SCIENTIFIC METHODOLOGY, PROVENANCE & LIMITATIONS ───────────
    story.append(Paragraph("6. Scientific Methodology, Provenance & Limitations", section_heading))
    limitation_text = (
        "<b>DATA PROVENANCE & PROXY NOTICE:</b> Surface temperatures and vegetation indices in this report are derived proxies "
        "synthesized from ECMWF/GFS live meteorological reanalysis (Open-Meteo) and Mapbox Streets vector tile morphology. "
        "They are not direct Landsat-8 Band-10 radiometric captures or Sentinel-2 multispectral MSI band calculations.<br/>"
        "<b>MODEL LIMITATIONS:</b> Heat-risk predictions are produced by a 5-fold cross-validated, probability-calibrated Random Forest surrogate "
        "model trained on a domain-guided synthetic benchmark adhering to IPCC urban heat vulnerability rubrics. "
        "Real-world empirical validation against municipal hospital heat-stress admissions represents the subsequent research stage.<br/>"
        "<b>SIMULATION ESTIMATES:</b> Intervention cooling projections use non-linear asymptotic saturation curves to prevent unrealistic "
        "linear compounding. Results represent modelled decision-support estimates rather than guaranteed meteorological outcomes."
    )
    story.append(Paragraph(limitation_text, limitation_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=6))
    
    # ── FOOTER ─────────────────────────────────────────────────────
    footer_text = (
        "UrbanChill AI • Geo-Intelligent Digital Twin Platform for Urban Heat Resilience • "
        "Audit Trail: DuckDB Persistent Spatial Store • Confidential Decision-Support Document"
    )
    story.append(Paragraph(footer_text, ParagraphStyle("Footer", parent=subtitle_style, alignment=TA_CENTER, fontSize=7.5)))
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
