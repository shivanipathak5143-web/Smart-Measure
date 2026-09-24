import json
from pathlib import Path
from typing import Optional, Tuple

# (mean_cm, std_cm) per dimension. Keep your existing table and extend it.
PRIORS = {
    "person":       {"height": (165, 12)},
    "chair":        {"height": (90, 10)},
    "couch":        {"height": (85, 10), "width": (190, 35)},
    "dining table": {"height": (75, 4),  "width": (140, 35)},
    "refrigerator": {"height": (175, 20)},
    "bottle":       {"height": (24, 6)},
    "cup":          {"height": (10, 2),  "width": (8, 1.5)},
    "car":          {"height": (150, 15), "width": (185, 12)},
    "bicycle":      {"height": (100, 10)},
    "tv":           {"width": (100, 30)},
    "laptop":       {"width": (33, 3)},
    # anchors that appear in many scenes
    "door":         {"height": (205, 8), "width": (85, 8)},
    "a4 paper":     {"height": (29.7, 0.1), "width": (21.0, 0.1)},
    "credit card":  {"width": (8.56, 0.05), "height": (5.4, 0.05)},
    "keyboard":     {"width": (44, 4)},
    "monitor":      {"width": (55, 8)},
    "backpack":     {"height": (45, 6)},
    "microwave":    {"width": (48, 6)},
    "bed":          {"width": (150, 40), "height": (55, 10)},
}

ALIASES = {
    "sofa": "couch", "table": "dining table", "fridge": "refrigerator",
    "mug": "cup", "bike": "bicycle", "human": "person", "man": "person",
    "woman": "person", "tv monitor": "tv", "television": "tv",
    "notebook": "laptop", "computer monitor": "monitor",
}

CACHE = Path(__file__).with_name("prior_cache.json")
_cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}


def _norm(label: str) -> str:
    label = label.strip().lower()
    return ALIASES.get(label, label)


def _llm_prior(label: str) -> Optional[dict]:
    """Optional: ask an LLM once for a typical size, then cache it forever."""
    try:
        import anthropic
        client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=200,
            messages=[{"role": "user", "content":
                f'Typical real-world size of a "{label}" in cm. Reply ONLY with JSON: '
                '{"height":[mean,std],"width":[mean,std]}. Use null for a dimension '
                "that is meaningless. std reflects natural variation between instances."}],
        )
        raw = msg.content[0].text.strip().replace("```json", "").replace("```", "")
        data = json.loads(raw)
        return {k: tuple(v) for k, v in data.items() if v}
    except Exception:
        return None


def get_prior(label: Optional[str], dim: str) -> Optional[Tuple[float, float]]:
    """Return (mean, std) in cm, or None -> caller falls back to pure geometry."""
    if not label:
        return None
    label = _norm(label)
    if label in PRIORS and dim in PRIORS[label]:
        return PRIORS[label][dim]
    if label in _cache:
        val = _cache[label].get(dim)
        return tuple(val) if val else None
    found = _llm_prior(label)           # remove this block if you want fully offline
    _cache[label] = {k: list(v) for k, v in (found or {}).items()}
    CACHE.write_text(json.dumps(_cache, indent=2))
    val = _cache[label].get(dim)
    return tuple(val) if val else None