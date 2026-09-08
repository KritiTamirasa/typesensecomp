from app.ingredients import normalize_list
from app.services.ranking import compute_overlap, rank_key


def test_exact_match():
    owned = set(normalize_list(["egg", "spinach", "tomato"]))
    result = compute_overlap(normalize_list(["egg", "spinach", "tomato"]), owned)
    assert result["matched_count"] == 3
    assert result["missing_count"] == 0
    assert result["match_percentage"] == 100


def test_partial_match():
    owned = set(normalize_list(["egg", "spinach"]))
    result = compute_overlap(normalize_list(["egg", "spinach", "tomato", "onion"]), owned)
    assert result["matched_count"] == 2
    assert result["missing_count"] == 2
    assert result["match_percentage"] == 50


def test_normalization_makes_user_and_recipe_terms_match():
    owned = set(normalize_list(["Tomatoes", "Eggs"]))
    result = compute_overlap(normalize_list(["tomato", "egg"]), owned)
    assert result["matched_count"] == 2
    assert result["missing_count"] == 0


def test_rank_key_prefers_zero_missing_over_larger_recipe():
    # Recipe A: user has everything (0 missing). Recipe B: 3 missing, even
    # though it has more matched ingredients overall.
    key_a = rank_key(matched_count=5, missing_count=0, match_percentage=100, text_match=1.0)
    key_b = rank_key(matched_count=8, missing_count=3, match_percentage=73, text_match=1.0)
    assert sorted([key_a, key_b], reverse=True)[0] == key_a


def test_rank_key_fewer_missing_beats_higher_percentage():
    # 3/4 matched, 1 missing (75%) should outrank 9/11 matched, 2 missing (82%)
    # because missing-count is the primary sort key, not raw percentage.
    key_fewer_missing = rank_key(matched_count=3, missing_count=1, match_percentage=75)
    key_higher_pct = rank_key(matched_count=9, missing_count=2, match_percentage=82)
    ranked = sorted([key_fewer_missing, key_higher_pct], reverse=True)
    assert ranked[0] == key_fewer_missing


def test_rank_key_ties_broken_by_percentage_then_matched_count_then_relevance():
    same_missing_lower_pct = rank_key(matched_count=2, missing_count=1, match_percentage=67, text_match=1.0)
    same_missing_higher_pct = rank_key(matched_count=4, missing_count=1, match_percentage=80, text_match=0.5)
    ranked = sorted([same_missing_lower_pct, same_missing_higher_pct], reverse=True)
    assert ranked[0] == same_missing_higher_pct
