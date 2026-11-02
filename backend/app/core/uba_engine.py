"""
German Umweltbundesamt (UBA) & EU Green Taxonomy Emission Engine
Calculates CO2 equivalent (kg CO2e) based on official German climate parameters.
"""
from typing import Dict

# Official UBA Conversion Factors (kg CO2e per unit)
# References: Umweltbundesamt Deutschland & EU GHG Protocol Scope 1 & 2
UBA_FACTORS: Dict[str, float] = {
    "ELECTRICITY": 0.380,  # kg CO2 / kWh (German Power Mix Average)
    "NATURAL_GAS": 0.201,  # kg CO2 / kWh (Combustion & distribution)
    "WATER": 0.344,        # kg CO2 / m³ (Pumping, purification & sewage)
    "WASTE": 0.450         # kg CO2 / kg (Commercial municipal waste avg)
}

UNIT_MAPPING: Dict[str, str] = {
    "ELECTRICITY": "kWh",
    "NATURAL_GAS": "kWh",
    "WATER": "m³",
    "WASTE": "kg"
}


def get_unit_for_type(resource_type: str) -> str:
    """Returns official unit for a given resource type."""
    return UNIT_MAPPING.get(resource_type.upper(), "units")


def calculate_co2_emission(resource_type: str, raw_value: float) -> float:
    """
    Calculates CO2 emissions in kg based on German UBA factors.
    Formula: Raw Value * Emission Factor
    """
    if raw_value < 0:
        raise ValueError("Raw consumption value cannot be negative.")
    
    factor = UBA_FACTORS.get(resource_type.upper())
    if factor is None:
        raise ValueError(f"Unsupported resource type: {resource_type}")
    
    return round(raw_value * factor, 2)


def get_emission_factor(resource_type: str) -> float:
    """Returns the emission factor for audit disclosure."""
    return UBA_FACTORS.get(resource_type.upper(), 0.0)
