import unittest

from todo_app.server import build_parser


class BuildParserTests(unittest.TestCase):
    def test_build_parser_defaults(self) -> None:
        parser = build_parser()
        args = parser.parse_args([])
        self.assertIsInstance(args.host, str)
        self.assertIsInstance(args.port, int)
