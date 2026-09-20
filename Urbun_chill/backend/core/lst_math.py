import math

def dn_to_radiance(dn: float, mult: float = 3.3420e-4, add: float = 0.1) -> float:
    """
    Convert Landsat 8 Band 10 Digital Number (DN) to TOA Radiance.
    Default mult and add are standard Landsat 8 Band 10 rescaling factors.
    """
    return (mult * dn) + add

def radiance_to_brightness_temperature(radiance: float, k1: float = 774.8853, k2: float = 1321.0789) -> float:
    """
    Convert TOA Radiance to Brightness Temperature (Celsius).
    Default K1 and K2 are standard Landsat 8 Band 10 constants.
    """
    if radiance <= 0:
        raise ValueError("Radiance must be greater than zero.")
    
    bt_kelvin = k2 / math.log((k1 / radiance) + 1)
    return bt_kelvin - 273.15

def brightness_temperature_to_lst(bt_celsius: float, emissivity: float, wavelength_micrometers: float = 10.8) -> float:
    """
    Convert Brightness Temperature (Celsius) to Land Surface Temperature (LST) in Celsius.
    Using standard formula: LST = BT / (1 + (w * BT / p) * ln(e))
    Where:
    - w is wavelength of emitted radiance
    - p is h * c / s (1.438 * 10^-2 m K)
    - e is emissivity
    """
    if emissivity <= 0 or emissivity > 1:
        raise ValueError("Emissivity must be between 0 and 1.")
    
    bt_kelvin = bt_celsius + 273.15
    p = 14380.0  # h * c / s in micrometer * Kelvin
    
    lst_kelvin = bt_kelvin / (1 + (wavelength_micrometers * bt_kelvin / p) * math.log(emissivity))
    return lst_kelvin - 273.15

def calculate_lst_from_dn(dn: float, emissivity: float) -> float:
    """
    End-to-end conversion from DN to LST (Celsius) for Landsat 8 Band 10.
    """
    radiance = dn_to_radiance(dn)
    bt_c = radiance_to_brightness_temperature(radiance)
    lst_c = brightness_temperature_to_lst(bt_c, emissivity)
    return lst_c
