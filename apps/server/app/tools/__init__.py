"""Tool registry — auto-discovers tool packages in this directory.

To add a new tool:
1. Create a package: ``app/tools/<tool_name>/``
2. Implement ``router.py``, ``service.py``, ``schemas.py`` as needed.
3. In the package's ``__init__.py``, expose ``tool = ToolDefinition(...)``.

That's it — it gets mounted at ``/api/tools/{tool.id}`` automatically.
"""

import importlib
import pkgutil

from app.tools.base import ToolDefinition


def discover_tools() -> list[ToolDefinition]:
    """Import every subpackage of ``app.tools`` and collect its ``tool``."""
    import app.tools as tools_pkg

    tools: list[ToolDefinition] = []
    for mod_info in pkgutil.iter_modules(tools_pkg.__path__):
        if not mod_info.ispkg:
            continue
        module = importlib.import_module(f"app.tools.{mod_info.name}")
        definition = getattr(module, "tool", None)
        if isinstance(definition, ToolDefinition):
            tools.append(definition)
    return sorted(tools, key=lambda t: t.id)
