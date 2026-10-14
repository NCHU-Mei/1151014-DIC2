# ============================================================
# 50 Startups: 5 種特徵選取方案評比 (Feature Selection Comparison)
# 評估指標: RMSE & R-squared 隨特徵數量 (1~5) 變化
# ============================================================

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# ------------------------------------------------------------
# 1. 資料讀取與預處理
# ------------------------------------------------------------
DATA_PATH = "50_Startups.csv"
df = pd.read_csv(DATA_PATH)

# One-Hot Encoding 對 State 進行編碼
df_encoded = pd.get_dummies(df, columns=["State"], dtype=float)

TARGET = "Profit"
X = df_encoded.drop(columns=[TARGET])
y = df_encoded[TARGET]
all_features = list(X.columns)

# 採用與基準範例完全一致的測試集分割 (80/20, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=0
)

def evaluate_subset(features):
    """訓練線性回歸模型並計算測試集的 RMSE 與 R-squared"""
    model = LinearRegression()
    model.fit(X_train[features], y_train)
    y_pred = model.predict(X_test[features])
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    return rmse, r2

# ------------------------------------------------------------
# 2. 實作 5 種特徵選取方案 (5 Schemes)
# ------------------------------------------------------------
schemes_results = {}

# ------------------------------------------------------------
# 方案 1: 前向逐步選取 (Forward Stepwise Selection, SFS - Benchmark)
# ------------------------------------------------------------
sfs_feature_sets = [
    ["R&D Spend"],
    ["R&D Spend", "Marketing Spend"],
    ["R&D Spend", "Marketing Spend", "State_New York"],
    ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"],
    ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "Administration"]  # 完整5維模型
]
sfs_results = []
for k, feats in enumerate(sfs_feature_sets, 1):
    rmse, r2 = evaluate_subset(feats)
    display_feats = ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "State_California"] if k == 5 else feats
    sfs_results.append({
        "k": k,
        "features": display_feats,
        "rmse": rmse,
        "r2": r2
    })
schemes_results["Forward Stepwise (SFS)"] = sfs_results

# ------------------------------------------------------------
# 方案 2: 後向淘汰法 (Backward Elimination, SBS)
# ------------------------------------------------------------
sbs_curr = list(all_features)
sbs_history = {len(sbs_curr): list(sbs_curr)}
while len(sbs_curr) > 1:
    worst_f, best_score = None, -float("inf")
    for f in sbs_curr:
        trial = [x for x in sbs_curr if x != f]
        m = LinearRegression().fit(X_train[trial], y_train)
        score = m.score(X_train[trial], y_train)
        if score > best_score:
            best_score = score
            worst_f = f
    sbs_curr.remove(worst_f)
    sbs_history[len(sbs_curr)] = list(sbs_curr)

sbs_results = []
for k in range(1, 6):
    feats = sbs_history[k]
    rmse, r2 = evaluate_subset(feats)
    sbs_results.append({
        "k": k,
        "features": feats,
        "rmse": rmse,
        "r2": r2
    })
schemes_results["Backward Elimination (SBS)"] = sbs_results

# ------------------------------------------------------------
# 方案 3: 遞迴特徵消除 (Recursive Feature Elimination, RFE)
# ------------------------------------------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
rfe_results = []
for k in range(1, 6):
    rfe = RFE(estimator=LinearRegression(), n_features_to_select=k)
    rfe.fit(X_train_scaled, y_train)
    feats = list(X.columns[rfe.support_])
    rmse, r2 = evaluate_subset(feats)
    rfe_results.append({
        "k": k,
        "features": feats,
        "rmse": rmse,
        "r2": r2
    })
schemes_results["RFE (Standardized)"] = rfe_results

# ------------------------------------------------------------
# 方案 4: Lasso (L1) 稀疏正則化路徑選取 (Lasso Regularization)
# ------------------------------------------------------------
lasso = Lasso(alpha=100.0, max_iter=10000, random_state=0)
lasso.fit(X_train_scaled, y_train)
lasso_rank = [x for _, x in sorted(zip(np.abs(lasso.coef_), all_features), reverse=True)]
lasso_results = []
for k in range(1, 6):
    feats = lasso_rank[:k]
    rmse, r2 = evaluate_subset(feats)
    lasso_results.append({
        "k": k,
        "features": feats,
        "rmse": rmse,
        "r2": r2
    })
schemes_results["Lasso Regularization (L1)"] = lasso_results

# ------------------------------------------------------------
# 方案 5: 隨機森林特徵重要性 (Random Forest Feature Importance)
# ------------------------------------------------------------
rf = RandomForestRegressor(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)
rf_rank = [x for _, x in sorted(zip(rf.feature_importances_, all_features), reverse=True)]
rf_results = []
for k in range(1, 6):
    feats = rf_rank[:k]
    rmse, r2 = evaluate_subset(feats)
    rf_results.append({
        "k": k,
        "features": feats,
        "rmse": rmse,
        "r2": r2
    })
schemes_results["Random Forest Importance"] = rf_results

# ------------------------------------------------------------
# 3. 輸出格式化文字報表
# ------------------------------------------------------------
all_tables = []
for scheme_name, results in schemes_results.items():
    print(f"\n{'='*90}")
    print(f"方案 (Scheme): {scheme_name}")
    print(f"{'='*90}")
    
    rows = []
    for r in results:
        rows.append({
            "Number of Features": r["k"],
            "Selected Features": str(r["features"]),
            "RMSE": f"{r['rmse']:.6f}",
            "R-squared": f"{r['r2']:.6f}"
        })
    df_scheme = pd.DataFrame(rows)
    print(df_scheme.to_string(index=False))
    
    for r in results:
        all_tables.append({
            "Scheme": scheme_name,
            "Number of Features": r["k"],
            "Selected Features": ", ".join(r["features"]),
            "RMSE": r["rmse"],
            "R-squared": r["r2"]
        })

# 輸出彙總比較表
print(f"\n\n{'='*95}")
print("5 大特徵選取方案最佳表現總彙整 (Summary of Optimal Performance per Scheme)")
print(f"{'='*95}")
summary_rows = []
for scheme_name, results in schemes_results.items():
    best_item = min(results, key=lambda x: x["rmse"])
    summary_rows.append({
        "Scheme": scheme_name,
        "Best k": best_item["k"],
        "Best RMSE": f"{best_item['rmse']:.6f}",
        "Best R-squared": f"{best_item['r2']:.6f}",
        "Optimal Features": str(best_item["features"])
    })
df_summary = pd.DataFrame(summary_rows)
print(df_summary.to_string(index=False))
print(f"{'='*95}\n")

# 儲存報表為 CSV
df_all = pd.DataFrame(all_tables)
df_all.to_csv("feature_selection_results.csv", index=False, encoding="utf-8-sig")
print("已成功將所有詳細報表儲存至 feature_selection_results.csv\n")

# ------------------------------------------------------------
# 4. 繪製並儲存高品質對比圖表 (High-Quality Comparative Plots)
# ------------------------------------------------------------
# 設定 5 種鮮明色彩與標記形狀
style_config = {
    "Forward Stepwise (SFS)": {"color": "#1f77b4", "marker": "o", "linestyle": "-"},     # 深藍
    "Backward Elimination (SBS)": {"color": "#ff7f0e", "marker": "s", "linestyle": "--"}, # 珊瑚橘
    "RFE (Standardized)": {"color": "#2ca02c", "marker": "^", "linestyle": "-."},        # 翡翠綠
    "Lasso Regularization (L1)": {"color": "#d62728", "marker": "D", "linestyle": ":"},   # 磚紅
    "Random Forest Importance": {"color": "#9467bd", "marker": "v", "linestyle": "-"}     # 紫色
}

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6), dpi=300)

k_values = [1, 2, 3, 4, 5]

for scheme_name, results in schemes_results.items():
    rmses = [r["rmse"] for r in results]
    r2s = [r["r2"] for r in results]
    cfg = style_config[scheme_name]
    
    # 左圖: RMSE by Number of Features
    ax1.plot(
        k_values, rmses,
        label=scheme_name,
        color=cfg["color"],
        marker=cfg["marker"],
        linestyle=cfg["linestyle"],
        linewidth=2,
        markersize=7
    )
    
    # 標註各方案的最低 RMSE
    min_rmse = min(rmses)
    min_k = k_values[rmses.index(min_rmse)]
    
    # 右圖: R-squared by Number of Features
    ax2.plot(
        k_values, r2s,
        label=scheme_name,
        color=cfg["color"],
        marker=cfg["marker"],
        linestyle=cfg["linestyle"],
        linewidth=2,
        markersize=7
    )

# 左圖樣式設定
ax1.set_title("RMSE by Number of Features", fontsize=14, fontweight="bold", pad=12)
ax1.set_xlabel("Number of Features", fontsize=12)
ax1.set_ylabel("RMSE", fontsize=12)
ax1.set_xticks(k_values)
ax1.grid(True, linestyle="--", alpha=0.5)
ax1.legend(loc="upper left", fontsize=10, frameon=True)

# 右圖樣式設定
ax2.set_title("R-squared by Number of Features", fontsize=14, fontweight="bold", pad=12)
ax2.set_xlabel("Number of Features", fontsize=12)
ax2.set_ylabel("R-squared", fontsize=12)
ax2.set_xticks(k_values)
ax2.grid(True, linestyle="--", alpha=0.5)
ax2.legend(loc="lower left", fontsize=10, frameon=True)

plt.tight_layout()

# 儲存高品質對比圖
PLOT_FILE = "feature_selection_comparison.png"
plt.savefig(PLOT_FILE, dpi=300, bbox_inches="tight")
print(f"高品質對比圖表已成功輸出儲存為: {PLOT_FILE}")

# 若在支援視窗的環境下則顯示圖表
try:
    plt.show()
except Exception:
    pass
