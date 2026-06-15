import unittest

from todo_app.server import StaticAppHandler


class StaticAppHandlerTests(unittest.TestCase):
    def test_mjs_extension_uses_javascript_mime_type(self) -> None:
        self.assertEqual(
            StaticAppHandler.extensions_map[".mjs"],
            "application/javascript",
        )


if __name__ == "__main__":
    unittest.main()
