import pytest
from app.ml.xgboost_classifier import xgboost_model, XGBoostFraudClassifier
from app.ml.isolation_forest import isolation_forest_model, IsolationForestAnomalyDetector
from app.ml.lstm_behavioral import lstm_model, LSTMBehavioralModel
from app.ml.rule_engine import rule_engine, FraudRuleEngine
from app.ml.risk_aggregator import risk_aggregator, RiskAggregator
from app.ml.shap_explainer import shap_explainer, SHAPExplainer
from app.services.feature_engineering import feature_pipeline
from app.schemas.fraud import RuleTriggered

class TestFeatureEngineering:
    def test_extract_features_normal(self):
        txn = {
            "transaction_id": "TXN-001",
            "amount": 2500.0,
            "merchant_category": "Food",
            "device_id": "DEV-100",
            "location": "Delhi, India",
            "timestamp": "2026-08-24T12:00:00Z"
        }
        history = [
            {"amount": 2000.0, "timestamp": "2026-08-24T10:00:00Z", "device_id": "DEV-100", "location": "Delhi, India"},
            {"amount": 2200.0, "timestamp": "2026-08-24T11:00:00Z", "device_id": "DEV-100", "location": "Delhi, India"}
        ]
        features = feature_pipeline.extract_features(txn, history)
        assert features["amount"] == 2500.0
        assert "amount_ratio_to_avg" in features
        assert "amount_zscore" in features
        assert "txns_last_5_min" in features
        assert "txns_last_1_hour" in features
        assert features["is_new_device"] is False
        assert features["impossible_travel"] is False

    def test_extract_features_new_device_and_spike(self):
        txn = {
            "transaction_id": "TXN-002",
            "amount": 95000.0,
            "merchant_category": "Luxury",
            "device_id": "DEV-UNKNOWN-99",
            "location": "London, UK",
            "latitude": 51.5074,
            "longitude": -0.1278,
            "timestamp": "2026-08-24T12:00:00Z"
        }
        history = [
            {
                "amount": 1500.0,
                "timestamp": "2026-08-24T11:45:00Z",
                "device_id": "DEV-100",
                "location": "Delhi, India",
                "latitude": 28.6139,
                "longitude": 77.2090
            }
        ]
        features = feature_pipeline.extract_features(txn, history)
        assert features["is_new_device"] is True
        assert features["amount_ratio_to_avg"] > 10.0
        assert features["impossible_travel"] is True

class TestXGBoostClassifier:
    def test_predict_proba_range(self):
        features = {
            "amount": 1200.0,
            "amount_ratio_to_avg": 1.0,
            "is_new_device": False,
            "txns_last_5_min": 0,
            "impossible_travel": False,
            "merchant_category": "Food"
        }
        score = xgboost_model.predict_proba(features)
        assert 0.01 <= score <= 0.99
        assert score < 0.20

    def test_predict_proba_high_risk(self):
        features = {
            "amount": 85000.0,
            "amount_ratio_to_avg": 4.5,
            "is_new_device": True,
            "txns_last_5_min": 4,
            "impossible_travel": True,
            "merchant_category": "Luxury"
        }
        score = xgboost_model.predict_proba(features)
        assert score > 0.80

class TestIsolationForest:
    def test_predict_anomaly_normal(self):
        features = {
            "amount_zscore": 0.2,
            "distance_from_previous_km": 10.0,
            "is_new_device": False,
            "txns_last_1_hour": 1
        }
        score = isolation_forest_model.predict_anomaly_score(features)
        assert 0.01 <= score <= 0.99
        assert score < 0.20

    def test_predict_anomaly_extreme_outlier(self):
        features = {
            "amount_zscore": 5.2,
            "distance_from_previous_km": 6500.0,
            "is_new_device": True,
            "txns_last_1_hour": 8
        }
        score = isolation_forest_model.predict_anomaly_score(features)
        assert score >= 0.70

class TestLSTMBehavioralModel:
    def test_predict_sequence_risk_normal(self):
        features = {"amount": 500.0}
        history = [450.0, 520.0, 480.0, 510.0]
        score = lstm_model.predict_sequence_risk(features, history)
        assert score < 0.30

    def test_predict_sequence_risk_spike(self):
        features = {"amount": 65000.0}
        history = [500.0, 450.0, 600.0, 550.0]
        score = lstm_model.predict_sequence_risk(features, history)
        assert score > 0.80

    def test_predict_sequence_risk_empty_history(self):
        features = {"amount": 2500.0}
        score = lstm_model.predict_sequence_risk(features, [])
        assert score == 0.05

class TestRuleEngine:
    def test_rule_101_limit_exceeded(self):
        engine = FraudRuleEngine()
        features = {"amount": 125000.0}
        triggered = engine.evaluate_rules(features)
        rule_ids = [r.rule_id for r in triggered]
        assert "RUL-101" in rule_ids

    def test_rule_102_new_device_high_amount(self):
        engine = FraudRuleEngine()
        features = {"amount": 45000.0, "is_new_device": True}
        triggered = engine.evaluate_rules(features)
        rule_ids = [r.rule_id for r in triggered]
        assert "RUL-102" in rule_ids

    def test_rule_103_velocity_burst(self):
        engine = FraudRuleEngine()
        features = {"txns_last_5_min": 4}
        triggered = engine.evaluate_rules(features)
        rule_ids = [r.rule_id for r in triggered]
        assert "RUL-103" in rule_ids

    def test_rule_104_impossible_travel(self):
        engine = FraudRuleEngine()
        features = {"impossible_travel": True}
        triggered = engine.evaluate_rules(features)
        rule_ids = [r.rule_id for r in triggered]
        assert "RUL-104" in rule_ids

    def test_no_rules_triggered(self):
        engine = FraudRuleEngine()
        features = {"amount": 500.0, "is_new_device": False, "txns_last_5_min": 1, "impossible_travel": False}
        triggered = engine.evaluate_rules(features)
        assert len(triggered) == 0

class TestRiskAggregator:
    def test_aggregate_low_risk(self):
        aggregator = RiskAggregator()
        final_score, risk_level, rule_score = aggregator.aggregate(
            xgboost_score=0.10,
            isolation_score=0.08,
            lstm_score=0.05,
            triggered_rules=[]
        )
        assert 0.0 <= final_score <= 0.30
        assert risk_level == "LOW"
        assert rule_score == 0.0

    def test_aggregate_critical_risk(self):
        aggregator = RiskAggregator()
        rule = RuleTriggered(rule_id="RUL-104", rule_name="Impossible Travel", severity="CRITICAL", description="Test")
        final_score, risk_level, rule_score = aggregator.aggregate(
            xgboost_score=0.92,
            isolation_score=0.88,
            lstm_score=0.85,
            triggered_rules=[rule]
        )
        assert final_score >= 0.80
        assert risk_level in ["HIGH", "CRITICAL"]
        assert rule_score > 0.0

class TestSHAPExplainer:
    def test_explain_returns_contributions(self):
        features = {
            "amount": 75000.0,
            "amount_ratio_to_avg": 4.5,
            "is_new_device": True,
            "txns_last_5_min": 3,
            "distance_from_previous_km": 1500.0,
            "impossible_travel": True,
            "merchant_category": "Luxury"
        }
        contributions, text = shap_explainer.explain(features, final_score=0.92)
        assert len(contributions) > 0
        assert any(c.is_risk_increasing for c in contributions)
        assert "HIGH RISK" in text
        assert isinstance(text, str)
