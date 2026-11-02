import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_metrics_and_dashboard_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as manager
        login_res = await ac.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"email": "manager@mueller-tech.de", "password": "Password123!"}
        )
        token = login_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 2. Get dashboard summary
        dash_res = await ac.get(f"{settings.API_V1_STR}/dashboard/summary", headers=auth_headers)
        assert dash_res.status_code == 200
        dash_data = dash_res.json()
        assert dash_data["company_name"] == "Müller Präzisionstechnik GmbH"
        assert dash_data["year_to_date_co2_kg"] > 0
        assert len(dash_data["by_resource"]) == 4

        # 3. Add new metric
        new_metric_payload = {
            "type": "ELECTRICITY",
            "value_kwh_or_m3": 5000.0,
            "billing_period_start": "2026-03-01",
            "billing_period_end": "2026-03-31"
        }
        create_res = await ac.post(
            f"{settings.API_V1_STR}/metrics",
            json=new_metric_payload,
            headers=auth_headers
        )
        assert create_res.status_code == 201
        created_metric = create_res.json()
        assert created_metric["co2_emissions_kg"] == 1900.0  # 5000 * 0.380
        assert created_metric["unit"] == "kWh"

        # 4. Get predictions
        pred_res = await ac.get(f"{settings.API_V1_STR}/dashboard/predictions", headers=auth_headers)
        assert pred_res.status_code == 200
        pred_data = pred_res.json()
        assert "predicted_co2_kg" in pred_data
        assert "reduction_advice_de" in pred_data
