import pytest
from core.lst_math import (
    dn_to_radiance,
    radiance_to_brightness_temperature,
    brightness_temperature_to_lst,
    calculate_lst_from_dn
)

def test_dn_to_radiance():
    # Example DN
    dn = 30000
    expected_radiance = (3.3420e-4 * dn) + 0.1
    assert dn_to_radiance(dn) == pytest.approx(expected_radiance)

def test_radiance_to_brightness_temperature():
    radiance = 10.0
    bt = radiance_to_brightness_temperature(radiance)
    # bt should be a sensible temperature in celsius
    assert -50 < bt < 100

def test_radiance_to_brightness_temperature_invalid():
    with pytest.raises(ValueError):
        radiance_to_brightness_temperature(0)
    with pytest.raises(ValueError):
        radiance_to_brightness_temperature(-5)

def test_brightness_temperature_to_lst():
    bt_celsius = 25.0
    emissivity = 0.98
    lst = brightness_temperature_to_lst(bt_celsius, emissivity)
    
    # LST should be higher than BT when emissivity < 1
    assert lst > bt_celsius

def test_brightness_temperature_to_lst_invalid_emissivity():
    with pytest.raises(ValueError):
        brightness_temperature_to_lst(25.0, 1.5)
    with pytest.raises(ValueError):
        brightness_temperature_to_lst(25.0, -0.1)

def test_calculate_lst_from_dn():
    dn = 35000
    emissivity = 0.98
    lst = calculate_lst_from_dn(dn, emissivity)
    assert isinstance(lst, float)
