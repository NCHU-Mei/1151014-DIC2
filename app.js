// ============================================================
// 50 Startups: 5 大特徵選取方案互動評比儀表板腳本
// ============================================================

// 5 大方案之完整評比數據庫
const SCHEMES_DATA = {
  sfs: {
    id: "sfs",
    name: "Forward Stepwise (SFS)",
    fullName: "方案 1: 前向逐步選取 (Forward Stepwise Selection, SFS)",
    paradigm: "包裝法 (Wrapper Method)",
    color: "#3b82f6", // 深藍
    badgeColor: "#3b82f6",
    marker: "circle",
    borderDash: [],
    description: "從空集合出發，每步貪婪評估並加入能使模型表現最佳的特徵（完全對齊基準範例）。",
    steps: [
      { k: 1, features: ["R&D Spend"], rmse: 8274.868018, r2: 0.946459 },
      { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.797191, r2: 0.947439, isOptimal: true },
      { k: 3, features: ["R&D Spend", "Marketing Spend", "State_New York"], rmse: 8309.059683, r2: 0.946015 },
      { k: 4, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"], rmse: 8409.916714, r2: 0.944697 },
      { k: 5, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "State_California"], rmse: 9137.990153, r2: 0.934707 }
    ]
  },
  sbs: {
    id: "sbs",
    name: "Backward Elimination (SBS)",
    fullName: "方案 2: 後向淘汰法 (Backward Elimination, SBS)",
    paradigm: "包裝法 (Wrapper Method)",
    color: "#f97316", // 珊瑚橘
    badgeColor: "#f97316",
    marker: "rect",
    borderDash: [5, 5],
    description: "由所有特徵出發，每次遞迴剔除對模型殘差平方和貢獻最低（即最不顯著）的特徵。",
    steps: [
      { k: 1, features: ["R&D Spend"], rmse: 8274.868018, r2: 0.946459 },
      { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.797191, r2: 0.947439, isOptimal: true },
      { k: 3, features: ["R&D Spend", "Administration", "Marketing Spend"], rmse: 8803.775790, r2: 0.939396 },
      { k: 4, features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida"], rmse: 9068.541185, r2: 0.935696 },
      { k: 5, features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida", "State_New York"], rmse: 9137.990153, r2: 0.934707 }
    ]
  },
  rfe: {
    id: "rfe",
    name: "RFE (Standardized)",
    fullName: "方案 3: 遞迴特徵消除 (RFE - Standardized)",
    paradigm: "敏感度包裝法 (Sensitivity Wrapper)",
    color: "#10b981", // 翡翠綠
    badgeColor: "#10b981",
    marker: "triangle",
    borderDash: [6, 3, 2, 3],
    description: "先將特徵經 Z-Score 標準化，依據多元線性迴歸係數絕對權重進行遞迴剪枝消除。",
    steps: [
      { k: 1, features: ["R&D Spend"], rmse: 8274.868018, r2: 0.946459 },
      { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.797191, r2: 0.947439, isOptimal: true },
      { k: 3, features: ["R&D Spend", "Administration", "Marketing Spend"], rmse: 8803.775790, r2: 0.939396 },
      { k: 4, features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida"], rmse: 9068.541185, r2: 0.935696 },
      { k: 5, features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida", "State_New York"], rmse: 9137.990153, r2: 0.934707 }
    ]
  },
  lasso: {
    id: "lasso",
    name: "Lasso Regularization (L1)",
    fullName: "方案 4: Lasso (L1) 稀疏正則化 (Lasso Regularization)",
    paradigm: "線性嵌入法 (Linear Embedded)",
    color: "#ef4444", // 磚紅
    badgeColor: "#ef4444",
    marker: "rectRot",
    borderDash: [3, 3],
    description: "利用 L1 罰項將次要特徵係數直接壓縮為 0，按正則化權重路徑強弱順序進行特徵選取。",
    steps: [
      { k: 1, features: ["R&D Spend"], rmse: 8274.868018, r2: 0.946459 },
      { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.797191, r2: 0.947439, isOptimal: true },
      { k: 3, features: ["R&D Spend", "Marketing Spend", "Administration"], rmse: 8803.775790, r2: 0.939396 },
      { k: 4, features: ["R&D Spend", "Marketing Spend", "Administration", "State_Florida"], rmse: 9068.541185, r2: 0.935696 },
      { k: 5, features: ["R&D Spend", "Marketing Spend", "Administration", "State_Florida", "State_New York"], rmse: 9137.990153, r2: 0.934707 }
    ]
  },
  rf: {
    id: "rf",
    name: "Random Forest Importance",
    fullName: "方案 5: 隨機森林特徵重要性 (Random Forest Importance)",
    paradigm: "樹模型嵌入法 (Tree-based Embedded)",
    color: "#8b5cf6", // 紫色
    badgeColor: "#8b5cf6",
    marker: "star",
    borderDash: [],
    description: "訓練 100 棵決策樹，計算各特徵對 Gini 不純度減少程度（Impurity Reduction）進行排序。",
    steps: [
      { k: 1, features: ["R&D Spend"], rmse: 8274.868018, r2: 0.946459 },
      { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.797191, r2: 0.947439, isOptimal: true },
      { k: 3, features: ["R&D Spend", "Marketing Spend", "Administration"], rmse: 8803.775790, r2: 0.939396 },
      { k: 4, features: ["R&D Spend", "Marketing Spend", "Administration", "State_California"], rmse: 8803.686429, r2: 0.939397 },
      { k: 5, features: ["R&D Spend", "Marketing Spend", "Administration", "State_California", "State_Florida"], rmse: 9137.990153, r2: 0.934707 }
    ]
  }
};

// 狀態管理
let activeSchemes = new Set(["sfs", "sbs", "rfe", "lasso", "rf"]);
let rmseChart = null;
let r2Chart = null;

// ============================================================
// 初始化核心應用
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initSchemesPills();
  initCharts();
  initInspector();
  initPlayground();
  initTable();
  initExportCsv();
});

// ============================================================
// 1. 主題切換 (Dark / Light Theme)
// ============================================================
function initThemeToggle() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    document.body.classList.toggle("dark-theme");
    updateChartsTheme();
  });
}

function updateChartsTheme() {
  const isLight = document.body.classList.contains("light-theme");
  const gridColor = isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)";
  const textColor = isLight ? "#475569" : "#94a3b8";

  [rmseChart, r2Chart].forEach(chart => {
    if (chart) {
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.update();
    }
  });
}

// ============================================================
// 2. 方案按鈕過濾器 (Schemes Toggle Pills)
// ============================================================
function initSchemesPills() {
  const container = document.getElementById("schemesPillsContainer");
  container.innerHTML = "";

  Object.values(SCHEMES_DATA).forEach(scheme => {
    const pill = document.createElement("button");
    pill.className = "scheme-toggle-pill active";
    pill.style.setProperty("--pill-color", scheme.color);
    pill.dataset.scheme = scheme.id;
    pill.innerHTML = `
      <span class="scheme-dot"></span>
      <span>${scheme.name}</span>
    `;

    pill.addEventListener("click", () => {
      if (activeSchemes.has(scheme.id)) {
        if (activeSchemes.size > 1) {
          activeSchemes.delete(scheme.id);
          pill.classList.remove("active");
        }
      } else {
        activeSchemes.add(scheme.id);
        pill.classList.add("active");
      }
      updateCharts();
    });

    container.appendChild(pill);
  });

  // 全選按鈕
  document.getElementById("showAllSchemesBtn").addEventListener("click", () => {
    Object.keys(SCHEMES_DATA).forEach(id => activeSchemes.add(id));
    document.querySelectorAll(".scheme-toggle-pill").forEach(p => p.classList.add("active"));
    updateCharts();
  });

  // 重設為僅前向逐步
  document.getElementById("clearSchemesBtn").addEventListener("click", () => {
    activeSchemes.clear();
    activeSchemes.add("sfs");
    document.querySelectorAll(".scheme-toggle-pill").forEach(p => {
      if (p.dataset.scheme === "sfs") p.classList.add("active");
      else p.classList.remove("active");
    });
    updateCharts();
  });
}

// ============================================================
// 3. Chart.js 雙子圖配置與繪製
// ============================================================
function initCharts() {
  const isLight = document.body.classList.contains("light-theme");
  const gridColor = isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)";
  const textColor = isLight ? "#475569" : "#94a3b8";
  const kLabels = [1, 2, 3, 4, 5];

  // 共用圖表設定
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: textColor,
          font: { family: "Plus Jakarta Sans", size: 11, weight: 600 },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          afterTitle: function(context) {
            const k = context[0].label;
            return `特徵數量 (Features): ${k}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Number of Features",
          color: textColor,
          font: { family: "Plus Jakarta Sans", weight: 600, size: 12 }
        },
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: "JetBrains Mono", size: 11 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: "JetBrains Mono", size: 11 } }
      }
    }
  };

  // 1. 初始化 RMSE 圖表
  const ctxRmse = document.getElementById("rmseChart").getContext("2d");
  rmseChart = new Chart(ctxRmse, {
    type: "line",
    data: { labels: kLabels, datasets: [] },
    options: {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales.y,
          title: {
            display: true,
            text: "RMSE (Root Mean Squared Error)",
            color: textColor,
            font: { family: "Plus Jakarta Sans", weight: 600, size: 12 }
          },
          ticks: {
            ...commonOptions.scales.y.ticks,
            callback: value => `$${value.toLocaleString()}`
          }
        }
      }
    }
  });

  // 2. 初始化 R-squared 圖表
  const ctxR2 = document.getElementById("r2Chart").getContext("2d");
  r2Chart = new Chart(ctxR2, {
    type: "line",
    data: { labels: kLabels, datasets: [] },
    options: {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales.y,
          title: {
            display: true,
            text: "R-squared (決定係數 R²)",
            color: textColor,
            font: { family: "Plus Jakarta Sans", weight: 600, size: 12 }
          },
          ticks: {
            ...commonOptions.scales.y.ticks,
            callback: value => value.toFixed(3)
          }
        }
      }
    }
  });

  updateCharts();
}

function updateCharts() {
  if (!rmseChart || !r2Chart) return;

  const rmseDatasets = [];
  const r2Datasets = [];

  Object.values(SCHEMES_DATA).forEach(scheme => {
    if (activeSchemes.has(scheme.id)) {
      const rmsePoints = scheme.steps.map(s => s.rmse);
      const r2Points = scheme.steps.map(s => s.r2);

      rmseDatasets.push({
        label: scheme.name,
        data: rmsePoints,
        borderColor: scheme.color,
        backgroundColor: scheme.color,
        borderWidth: 2.2,
        pointStyle: scheme.marker,
        pointRadius: 6,
        pointHoverRadius: 9,
        borderDash: scheme.borderDash,
        tension: 0.15
      });

      r2Datasets.push({
        label: scheme.name,
        data: r2Points,
        borderColor: scheme.color,
        backgroundColor: scheme.color,
        borderWidth: 2.2,
        pointStyle: scheme.marker,
        pointRadius: 6,
        pointHoverRadius: 9,
        borderDash: scheme.borderDash,
        tension: 0.15
      });
    }
  });

  rmseChart.data.datasets = rmseDatasets;
  r2Chart.data.datasets = r2Datasets;
  rmseChart.update();
  r2Chart.update();
}

// ============================================================
// 4. 方案歷程深度探索 (Step Inspector)
// ============================================================
function initInspector() {
  const schemeSelect = document.getElementById("inspectorSchemeSelect");
  const kSlider = document.getElementById("inspectorKSlider");
  const kIndicator = document.getElementById("sliderKValue");

  function updateInspectorView() {
    const schemeId = schemeSelect.value;
    const k = parseInt(kSlider.value, 10);
    const scheme = SCHEMES_DATA[schemeId];
    const stepData = scheme.steps.find(s => s.k === k);

    kIndicator.textContent = `k = ${k}${k === 2 ? " ★ (最佳)" : ""}`;
    document.getElementById("inspectorParadigm").textContent = scheme.paradigm;
    document.getElementById("inspectorDescription").textContent = scheme.description;

    // 渲染特徵徽章清單
    const pillsContainer = document.getElementById("inspectorFeatureList");
    pillsContainer.innerHTML = "";
    stepData.features.forEach(f => {
      const pill = document.createElement("span");
      pill.className = "pill-item";
      pill.textContent = f;
      pillsContainer.appendChild(pill);
    });

    // 渲染數據
    document.getElementById("inspectorRmseVal").textContent = `$${stepData.rmse.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("inspectorR2Val").textContent = stepData.r2.toFixed(4);

    const rmseSub = document.getElementById("inspectorRmseSub");
    const r2Sub = document.getElementById("inspectorR2Sub");
    if (k === 2) {
      rmseSub.textContent = "全域最佳低點 (Optimal)";
      rmseSub.style.color = "var(--success)";
      r2Sub.textContent = "解釋率最高 94.74%";
      r2Sub.style.color = "var(--success)";
    } else if (k > 2) {
      rmseSub.textContent = "泛化誤差升高 (過度擬合)";
      rmseSub.style.color = "var(--warning)";
      r2Sub.textContent = "模型複雜度增加";
      r2Sub.style.color = "var(--text-muted)";
    } else {
      rmseSub.textContent = "單特徵偏高";
      rmseSub.style.color = "var(--text-muted)";
      r2Sub.textContent = "解釋率 94.65%";
      r2Sub.style.color = "var(--text-muted)";
    }
  }

  schemeSelect.addEventListener("change", updateInspectorView);
  kSlider.addEventListener("input", updateInspectorView);

  updateInspectorView();
}

// ============================================================
// 5. 新創獲利即時試算器 (Live Profit Predictor)
// ============================================================
function initPlayground() {
  const rdInput = document.getElementById("inputRd");
  const mktInput = document.getElementById("inputMarketing");
  const calcBtn = document.getElementById("calculateProfitBtn");

  function calculate() {
    const rd = parseFloat(rdInput.value) || 0;
    const mkt = parseFloat(mktInput.value) || 0;

    // 最優迴歸公式 (k=2 模型):
    // Intercept: 46346.33876
    // R&D Spend Coef: 0.788618
    // Marketing Spend Coef: 0.032577
    const intercept = 46346.33876;
    const rdContribution = rd * 0.7886183;
    const mktContribution = mkt * 0.0325766;
    const predictedProfit = intercept + rdContribution + mktContribution;

    document.getElementById("predictedProfitDisplay").textContent = `$${predictedProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("predictionBreakdown").innerHTML = `
      基準截距 $${intercept.toLocaleString("en-US", { maximumFractionDigits: 2 })} + 
      研發貢獻 $${rdContribution.toLocaleString("en-US", { maximumFractionDigits: 2 })} + 
      行銷貢獻 $${mktContribution.toLocaleString("en-US", { maximumFractionDigits: 2 })}
    `;
  }

  calcBtn.addEventListener("click", calculate);
  rdInput.addEventListener("input", calculate);
  mktInput.addEventListener("input", calculate);

  calculate();
}

// ============================================================
// 6. 全方案歷程資料表 (Results Data Table)
// ============================================================
function initTable() {
  const tableBody = document.getElementById("tableBody");
  const filterSelect = document.getElementById("tableSchemeFilter");

  function renderTable() {
    const selectedScheme = filterSelect.value;
    tableBody.innerHTML = "";

    Object.values(SCHEMES_DATA).forEach(scheme => {
      if (selectedScheme === "all" || selectedScheme === scheme.id) {
        scheme.steps.forEach(step => {
          const tr = document.createElement("tr");
          if (step.isOptimal) tr.className = "optimal-row";

          tr.innerHTML = `
            <td>
              <span class="status-badge" style="background: ${scheme.color}20; color: ${scheme.color}; border: 1px solid ${scheme.color}40;">
                ${scheme.name}
              </span>
            </td>
            <td><strong style="font-family: var(--font-mono)">k = ${step.k}</strong></td>
            <td>
              <div class="kpi-tags">
                ${step.features.map(f => `<span class="feature-tag ${step.isOptimal ? "highlight-tag" : ""}">${f}</span>`).join("")}
              </div>
            </td>
            <td class="text-right" style="font-family: var(--font-mono)">$${step.rmse.toFixed(6)}</td>
            <td class="text-right" style="font-family: var(--font-mono)">${step.r2.toFixed(6)}</td>
            <td class="text-center">
              ${step.isOptimal 
                ? `<span class="status-badge badge-optimal">★ 全域最佳 (Optimal)</span>` 
                : `<span class="status-badge badge-suboptimal">一般</span>`
              }
            </td>
          `;

          tableBody.appendChild(tr);
        });
      }
    });
  }

  filterSelect.addEventListener("change", renderTable);
  renderTable();
}

// ============================================================
// 7. 匯出 CSV (Export to CSV)
// ============================================================
function initExportCsv() {
  document.getElementById("exportCsvBtn").addEventListener("click", () => {
    const rows = [["Scheme", "Number of Features (k)", "Selected Features", "RMSE", "R-squared", "Is Optimal"]];

    Object.values(SCHEMES_DATA).forEach(scheme => {
      scheme.steps.forEach(step => {
        rows.push([
          scheme.name,
          step.k,
          `"${step.features.join(", ")}"`,
          step.rmse.toFixed(6),
          step.r2.toFixed(6),
          step.isOptimal ? "YES" : "NO"
        ]);
      });
    });

    const csvContent = "\uFEFF" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "50_startups_feature_selection_comparison.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
