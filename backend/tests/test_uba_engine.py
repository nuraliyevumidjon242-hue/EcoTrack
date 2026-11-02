import pytest
from app.core.uba_engine import calculate_co2_emission, get_unit_for_type, get_emission_factor, UBA_FACTORS


def test_uba_electricity_calculation():
    # 1000 kWh * 0.380 kg/kWh = 380.0 kg
    res = calculate_co2_emission("ELECTRICITY", 1000.0)
    assert res == 380.0


def test_uba_gas_calculation():
    # 500 kWh * 0.201 kg/kWh = 100.5 kg
    res = calculate_co2_emission("NATURAL_GAS", 500.0)
    assert res == 100.5


def test_uba_water_calculation():
    # 100 m3 * 0.344 kg/m3 = 34.4 kg
    res = calculate_co2_emission("WATER", 100.0)
    assert res == 34.4


def test_uba_waste_calculation():
    # 200 kg * 0.450 kg/kg = 90.0 kg
    res = calculate_co2_emission("WASTE", 200.0)
    assert res == 90.0


def test_invalid_resource_type():
    with pytest.raises(ValueError, match="Unsupported resource type"):
        calculate_co2_emission("PLUTONIUM", 100.0)


def test_negative_value():
    with pytest.raises(ValueError, match="cannot be negative"):
        calculate_co2_emission("ELECTRICITY", -50.0)


def test_unit_mapping():
    assert get_unit_for_type("ELECTRICITY") == "kWh"
    assert get_unit_for_type("WATER") == "m³"
    assert get_unit_for_type("WASTE") == "kg"
