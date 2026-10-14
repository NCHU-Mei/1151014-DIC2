
# ============================================================
# Multiple Linear Regression: 50 Startups
# Framework: Scikit-learn
# Methodology: CRISP-DM
# ============================================================

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# ------------------------------------------------------------
# Phase 1: Business Understanding
# Predict startup Profit using spending and State.
# ------------------------------------------------------------

TARGET = "Profit"
DATA_PATH = "50_Startups.csv"

# ------------------------------------------------------------
# Phase 2: Data Understanding
# ------------------------------------------------------------

df = pd.read_csv(DATA_PATH)

print("Dataset shape:", df.shape)
print("\nFirst 5 rows:")
print(df.head())

print("\nData types:")
print(df.dtypes)

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate rows:", df.duplicated().sum())
print("\nSummary statistics:")
print(df.describe())

# Remove duplicate rows, if any
df = df.drop_duplicates().copy()

# Remove rows with missing values for this basic example
df = df.dropna().copy()

# ------------------------------------------------------------
# Phase 3: Data Preparation
# ------------------------------------------------------------

# Features and target
X = df.drop(columns=[TARGET])
y = df[TARGET]

# Identify numerical and categorical columns
numeric_features = X.select_dtypes(
    include=["number"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object", "category", "bool", "str"]
).columns.tolist()

print("\nNumerical features:", numeric_features)
print("Categorical features:", categorical_features)

# One-Hot Encoding for State
# drop="first" avoids perfect multicollinearity with intercept
preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                drop="first",
                handle_unknown="ignore"
            ),
            categorical_features
        ),
        ("numerical", "passthrough", numeric_features)
    ],
    remainder="drop"
)

# Split before fitting the preprocessing pipeline
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))

# ------------------------------------------------------------
# Phase 4: Modeling
# ------------------------------------------------------------

model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("regressor", LinearRegression())
    ]
)

# Train the model
model.fit(X_train, y_train)

# Make predictions
y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

print("\nModel training completed.")

# Display regression coefficients
feature_names = model.named_steps[
    "preprocessor"
].get_feature_names_out()

coefficients = model.named_steps[
    "regressor"
].coef_

coef_df = pd.DataFrame({
    "Feature": feature_names,
    "Coefficient": coefficients
})

print("\nIntercept:")
print(model.named_steps["regressor"].intercept_)

print("\nRegression coefficients:")
print(coef_df)

# ------------------------------------------------------------
# Phase 5: Evaluation
# ------------------------------------------------------------

def evaluate_regression(y_true, y_pred, dataset_name):
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)

    print(f"\n{dataset_name} Evaluation")
    print("-" * 35)
    print(f"MAE  : {mae:,.2f}")
    print(f"MSE  : {mse:,.2f}")
    print(f"RMSE : {rmse:,.2f}")
    print(f"R²   : {r2:.4f}")

    return {
        "MAE": mae,
        "MSE": mse,
        "RMSE": rmse,
        "R2": r2
    }

train_metrics = evaluate_regression(
    y_train, y_train_pred, "Training"
)

test_metrics = evaluate_regression(
    y_test, y_test_pred, "Testing"
)

# 5-fold cross-validation on training data
cv_scores = cross_val_score(
    model,
    X_train,
    y_train,
    cv=5,
    scoring="r2"
)

print("\n5-Fold Cross-Validation R²:")
print("Scores:", np.round(cv_scores, 4))
print(f"Mean R²: {cv_scores.mean():.4f}")
print(f"Std R² : {cv_scores.std():.4f}")

# Compare actual and predicted profit
results = pd.DataFrame({
    "Actual Profit": y_test.to_numpy(),
    "Predicted Profit": y_test_pred,
    "Residual": y_test.to_numpy() - y_test_pred
})

print("\nActual vs Predicted:")
print(results.round(2).to_string(index=False))

# Plot actual vs predicted
plt.figure(figsize=(7, 5))
plt.scatter(y_test, y_test_pred)

min_value = min(y_test.min(), y_test_pred.min())
max_value = max(y_test.max(), y_test_pred.max())

plt.plot(
    [min_value, max_value],
    [min_value, max_value],
    "r--"
)

plt.xlabel("Actual Profit")
plt.ylabel("Predicted Profit")
plt.title("Actual vs Predicted Profit")
plt.tight_layout()
plt.savefig("actual_vs_predicted.png")
plt.show()

# Residual diagnostic plot
residuals = y_test.to_numpy() - y_test_pred

plt.figure(figsize=(7, 5))
plt.scatter(y_test_pred, residuals)
plt.axhline(0, color="red", linestyle="--")
plt.xlabel("Predicted Profit")
plt.ylabel("Residuals")
plt.title("Residuals vs Predicted Profit")
plt.tight_layout()
plt.savefig("residuals_vs_predicted.png")
plt.show()

# ------------------------------------------------------------
# Phase 6: Deployment
# Save the entire pipeline, including preprocessing.
# ------------------------------------------------------------

joblib.dump(model, "startup_profit_model.pkl")
print("\nModel saved as startup_profit_model.pkl")

# Example: predict profit for a new startup
new_startup = pd.DataFrame([{
    "R&D Spend": 100000,
    "Administration": 120000,
    "Marketing Spend": 200000,
    "State": "California"
}])

predicted_profit = model.predict(new_startup)[0]

print(f"\nPredicted startup profit: ${predicted_profit:,.2f}")

# Load model later:
# loaded_model = joblib.load("startup_profit_model.pkl")
# print(loaded_model.predict(new_startup))
