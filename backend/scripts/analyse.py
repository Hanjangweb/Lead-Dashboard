#!/usr/bin/env python3
"""
LeadIQ - Python Data Analysis Script
=====================================
Connects to MongoDB, pulls lead data, and generates a comprehensive
statistical analysis report including visualisations.

Usage:
    pip install pymongo pandas matplotlib seaborn python-dotenv
    python analyse.py

Output:
    - Prints summary statistics to console
    - Saves charts to ./analysis_output/ directory
    - Exports a summary CSV to ./analysis_output/lead_analysis.csv
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# ─── try to import required packages ──────────────────────────────────────────
try:
    import pandas as pd
    import matplotlib
    matplotlib.use("Agg")  # Non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.ticker as ticker
    import seaborn as sns
    from pymongo import MongoClient
    from dotenv import load_dotenv
except ImportError as e:
    print(f"\n❌  Missing dependency: {e}")
    print("Run: pip install pymongo pandas matplotlib seaborn python-dotenv\n")
    sys.exit(1)

# ─── configuration ─────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent.parent / ".env")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "saas_dashboard")
COLL_NAME = "leads"
OUTPUT_DIR = Path(__file__).parent / "analysis_output"
OUTPUT_DIR.mkdir(exist_ok=True)

# ─── style ─────────────────────────────────────────────────────────────────────
PALETTE = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#0891b2", "#db2777", "#4f46e5"]
sns.set_theme(style="whitegrid", palette=PALETTE, font="DejaVu Sans")
plt.rcParams.update({"figure.dpi": 150, "axes.spines.top": False, "axes.spines.right": False})

# ═══════════════════════════════════════════════════════════════════════════════
def fetch_leads() -> pd.DataFrame:
    """Pull all leads from MongoDB into a DataFrame."""
    print("  Connecting to MongoDB...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")          # quick connectivity test
    db   = client[DB_NAME]
    coll = db[COLL_NAME]

    docs = list(coll.find({}, {"_id": 0}))
    if not docs:
        print("   No leads found in the database.")
        sys.exit(0)

    df = pd.DataFrame(docs)
    # normalise dates
    if "createdAt" in df.columns:
        df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
        df["month"]     = df["createdAt"].dt.to_period("M").astype(str)
    df["budget"] = pd.to_numeric(df.get("budget", 0), errors="coerce").fillna(0)
    print(f"  Loaded {len(df)} leads.\n")
    return df


# ═══════════════════════════════════════════════════════════════════════════════
def print_summary(df: pd.DataFrame) -> None:
    sep = "-" * 60
    print(sep)
    print("    LEADIQ - DATA ANALYSIS REPORT")
    print(f"  Generated: {datetime.now().strftime('%d %b %Y  %H:%M')}")
    print(sep)

    total = len(df)
    print(f"\n  Total Leads          : {total}")

    # Status breakdown
    print("\n  -- Status Breakdown --")
    for status, cnt in df["status"].value_counts().items():
        pct = cnt / total * 100
        bar = "#" * int(pct / 5)
        print(f"  {status:<14} {cnt:>4}  ({pct:5.1f}%)  {bar}")

    # Conversion KPIs
    converted   = (df["status"] == "Converted").sum()
    rejected    = (df["status"] == "Rejected").sum()
    conv_rate   = converted / total * 100 if total else 0
    reject_rate = rejected  / total * 100 if total else 0
    print(f"\n  Conversion Rate      : {conv_rate:.1f}%")
    print(f"  Rejection Rate       : {reject_rate:.1f}%")

    # Budget analysis
    print(f"\n  -- Budget Analytics --")
    print(f"  Total Pipeline       : RS {df['budget'].sum():,.0f}")
    print(f"  Average Deal         : RS {df['budget'].mean():,.0f}")
    print(f"  Largest Deal         : RS {df['budget'].max():,.0f}")
    print(f"  Smallest Deal        : RS {df['budget'].min():,.0f}")

    # Top city / service
    if "city" in df.columns:
        top_city = df["city"].value_counts().idxmax()
        print(f"\n  Top City             : {top_city}  ({df['city'].value_counts().max()} leads)")
    if "service" in df.columns:
        top_svc = df["service"].value_counts().idxmax()
        print(f"  Top Service          : {top_svc}  ({df['service'].value_counts().max()} leads)")

    # MoM growth
    if "month" in df.columns:
        monthly = df.groupby("month").size()
        if len(monthly) >= 2:
            this_m, prev_m = monthly.iloc[-1], monthly.iloc[-2]
            growth = (this_m - prev_m) / prev_m * 100 if prev_m else 0
            arrow  = "^" if growth >= 0 else "v"
            print(f"\n  MoM Lead Growth      : {arrow} {abs(growth):.1f}%  ({prev_m} → {this_m})")

    print(f"\n{sep}\n")


# ═══════════════════════════════════════════════════════════════════════════════
def plot_status_donut(df: pd.DataFrame) -> None:
    counts = df["status"].value_counts()
    colors = {"New": "#2563eb", "Interested": "#f59e0b", "Converted": "#10b981", "Rejected": "#ef4444"}
    fig, ax = plt.subplots(figsize=(7, 6))
    wedges, _, autotexts = ax.pie(
        counts, labels=None, colors=[colors.get(s, "#94a3b8") for s in counts.index],
        autopct="%1.1f%%", startangle=90,
        wedgeprops={"width": 0.55, "edgecolor": "white", "linewidth": 2},
        pctdistance=0.75,
    )
    for t in autotexts:
        t.set_fontsize(11); t.set_fontweight("bold"); t.set_color("white")
    ax.legend(wedges, counts.index, loc="lower center", ncol=len(counts), frameon=False,
              bbox_to_anchor=(0.5, -0.05), fontsize=11)
    ax.set_title("Status Breakdown (Doughnut)", fontsize=15, fontweight="bold", pad=15)
    fig.tight_layout()
    out = OUTPUT_DIR / "01_status_donut.png"
    fig.savefig(out); plt.close(fig)
    print(f"  Saved: {out.name}")


def plot_city_bar(df: pd.DataFrame) -> None:
    if "city" not in df.columns: return
    counts = df["city"].value_counts().head(10).sort_values()
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.barh(counts.index, counts.values, color=PALETTE[0], height=0.65)
    ax.bar_label(bars, padding=4, fontsize=11, fontweight="bold", color="#334155")
    ax.set_xlabel("Number of Leads", fontsize=12)
    ax.set_title("City-wise Lead Distribution (Top 10)", fontsize=15, fontweight="bold")
    ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True))
    fig.tight_layout()
    out = OUTPUT_DIR / "02_city_bar.png"
    fig.savefig(out); plt.close(fig)
    print(f"    Saved: {out.name}")


def plot_service_bar(df: pd.DataFrame) -> None:
    if "service" not in df.columns: return
    counts = df["service"].value_counts().head(10)
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(counts.index, counts.values, color=PALETTE[:len(counts)], width=0.65)
    ax.bar_label(bars, padding=3, fontsize=11, fontweight="bold", color="#334155")
    plt.xticks(rotation=25, ha="right", fontsize=10)
    ax.set_ylabel("Number of Leads", fontsize=12)
    ax.set_title("Service-wise Demand (Vertical Bar)", fontsize=15, fontweight="bold")
    ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))
    fig.tight_layout()
    out = OUTPUT_DIR / "03_service_bar.png"
    fig.savefig(out); plt.close(fig)
    print(f"    Saved: {out.name}")


def plot_monthly_trend(df: pd.DataFrame) -> None:
    if "month" not in df.columns: return
    monthly = df.groupby("month").size().reset_index(name="leads")
    if len(monthly) < 2: return
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.fill_between(monthly["month"], monthly["leads"], alpha=0.12, color=PALETTE[0])
    ax.plot(monthly["month"], monthly["leads"], color=PALETTE[0], linewidth=2.5, marker="o", markersize=7)
    for _, row in monthly.iterrows():
        ax.annotate(str(int(row["leads"])), (row["month"], row["leads"]),
                    textcoords="offset points", xytext=(0, 8), ha="center",
                    fontsize=10, fontweight="bold", color="#1e3a5f")
    plt.xticks(rotation=25, ha="right", fontsize=10)
    ax.set_ylabel("Leads Added", fontsize=12)
    ax.set_title("Monthly Lead Volume Trend", fontsize=15, fontweight="bold")
    fig.tight_layout()
    out = OUTPUT_DIR / "04_monthly_trend.png"
    fig.savefig(out); plt.close(fig)
    print(f"    Saved: {out.name}")


def plot_budget_distribution(df: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(9, 5))
    df["budget"].dropna().plot.hist(bins=20, ax=ax, color=PALETTE[4], edgecolor="white", linewidth=0.8)
    ax.set_xlabel("Budget (₹)", fontsize=12)
    ax.set_ylabel("Frequency", fontsize=12)
    ax.set_title("Budget Distribution", fontsize=15, fontweight="bold")
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f"₹{x/1000:.0f}k"))
    fig.tight_layout()
    out = OUTPUT_DIR / "05_budget_histogram.png"
    fig.savefig(out); plt.close(fig)
    print(f"    Saved: {out.name}")


def plot_conversion_by_service(df: pd.DataFrame) -> None:
    if "service" not in df.columns: return
    conv = (df[df["status"] == "Converted"].groupby("service").size()
            / df.groupby("service").size() * 100).fillna(0).sort_values(ascending=False).head(10)
    if conv.empty: return
    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(conv.index, conv.values, color=PALETTE[2], width=0.65)
    ax.bar_label(bars, fmt="%.1f%%", padding=3, fontsize=10, fontweight="bold")
    plt.xticks(rotation=25, ha="right", fontsize=10)
    ax.set_ylabel("Conversion Rate (%)", fontsize=12)
    ax.set_title("Conversion Rate by Service", fontsize=15, fontweight="bold")
    fig.tight_layout()
    out = OUTPUT_DIR / "06_conversion_by_service.png"
    fig.savefig(out); plt.close(fig)
    print(f"    Saved: {out.name}")


def export_csv(df: pd.DataFrame) -> None:
    out = OUTPUT_DIR / "lead_analysis.csv"
    df.to_csv(out, index=False)
    print(f"    Saved: {out.name}")


# ═══════════════════════════════════════════════════════════════════════════════
def main():
    print("\n  LeadIQ - Python Data Analysis\n")
    df = fetch_leads()

    print_summary(df)

    print("  Generating charts...")
    plot_status_donut(df)
    plot_city_bar(df)
    plot_service_bar(df)
    plot_monthly_trend(df)
    plot_budget_distribution(df)
    plot_conversion_by_service(df)
    export_csv(df)

    print(f"\n  All outputs saved to: {OUTPUT_DIR.resolve()}\n")


if __name__ == "__main__":
    main()
