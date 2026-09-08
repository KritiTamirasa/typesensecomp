from app.ingredients import normalize_ingredient, normalize_list


def test_lowercase_and_singularize():
    assert normalize_ingredient("Tomatoes") == "tomato"
    assert normalize_ingredient("Eggs") == "egg"
    assert normalize_ingredient("2 eggs") == "egg"


def test_strips_descriptor_noise():
    assert normalize_ingredient("fresh spinach") == "spinach"
    assert normalize_ingredient("chopped onions") == "onion"


def test_strips_quantity_and_unit_noise():
    assert normalize_ingredient("2 large tomatoes") == "tomato"
    assert normalize_ingredient("1 tbsp olive oil") == "olive oil"
    assert normalize_ingredient("3 cloves garlic") == "garlic"


def test_preserves_multi_word_after_singularizing_each_token():
    assert normalize_ingredient("Red Onions") == "red onion"


def test_synonym_mapping():
    assert normalize_ingredient("capsicum") == "bell pepper"
    assert normalize_ingredient("coriander leaves") == "cilantro"
    assert normalize_ingredient("scallions") == "scallion"


def test_normalize_list_dedupes_and_preserves_order():
    result = normalize_list(["Tomatoes", "tomato", "Eggs", "spinach", "Spinach"])
    assert result == ["tomato", "egg", "spinach"]


def test_normalize_list_drops_empty_entries():
    assert normalize_list(["", "   ", "egg"]) == ["egg"]
