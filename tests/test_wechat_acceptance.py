import importlib.util
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "wechat-article" / "scripts" / "wechat_acceptance.py"


spec = importlib.util.spec_from_file_location("wechat_acceptance", MODULE_PATH)
wechat_acceptance = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wechat_acceptance)


class WeChatAcceptanceTests(unittest.TestCase):
    def test_manual_paste_accepts_https_image(self):
        report = wechat_acceptance.build_report('<section><img src="https://example.com/a.jpg"></section>', "manual-paste")
        self.assertTrue(report["ok"])

    def test_api_requires_wechat_cdn_images(self):
        report = wechat_acceptance.build_report('<section><img src="https://example.com/a.jpg"></section>', "api-draft")
        self.assertFalse(report["ok"])
        self.assertIn("api-img-not-wechat-cdn", {item["code"] for item in report["issues"]})

    def test_rejects_relative_and_data_images(self):
        report = wechat_acceptance.build_report('<img src="images/a.jpg"><svg><image href="data:image/png;base64,aaa"></image></svg>', "manual-paste")
        self.assertFalse(report["ok"])
        codes = {item["code"] for item in report["issues"]}
        self.assertIn("non-public-img-src", codes)
        self.assertIn("data-uri", codes)
        self.assertIn("svg-image-not-https", codes)

    def test_rejects_complex_svg_and_grid(self):
        html = '<section style="display:grid"><svg><filter></filter><foreignObject></foreignObject><animateTransform></animateTransform></svg></section>'
        report = wechat_acceptance.build_report(html, "manual-paste")
        self.assertFalse(report["ok"])
        codes = {item["code"] for item in report["issues"]}
        self.assertIn("grid-layout", codes)
        self.assertIn("svg-filter", codes)
        self.assertIn("svg-foreign-object", codes)


if __name__ == "__main__":
    unittest.main()
