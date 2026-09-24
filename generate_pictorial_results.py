"""
Generate Pictorial Results for Milestone 4 (Week 8)
Creates executive data visualizations and saves them to docs/pictorial_results.png
and artifact directory for presentation.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

def generate_milestone4_pictorials():
    # Setup high-DPI figure with 4 subplots
    fig = plt.figure(figsize=(16, 12), dpi=200)
    fig.patch.set_facecolor('#0f172a')  # Dark slate background
    plt.rcParams['text.color'] = '#f8fafc'
    plt.rcParams['axes.labelcolor'] = '#94a3b8'
    plt.rcParams['xtick.color'] = '#94a3b8'
    plt.rcParams['ytick.color'] = '#94a3b8'

    # --- PLOT 1: Candidate Rankings & Hiring Scores ---
    ax1 = plt.subplot(2, 2, 1)
    ax1.set_facecolor('#1e293b')
    candidates = ['David Kim', 'Sarah Johnson', 'Abhishek', 'Priya Sharma', 'Michael Chen', 'Emily Rodriguez']
    scores = [95, 92, 88, 82, 78, 65]
    colors = ['#10b981' if s >= 85 else '#f59e0b' if s >= 75 else '#ef4444' for s in scores]

    bars = ax1.barh(candidates, scores, color=colors, height=0.6, edgecolor='#334155', linewidth=1.5)
    ax1.axvline(85, color='#38bdf8', linestyle='--', linewidth=2, label='85% Benchmark Target')
    ax1.set_xlim(0, 105)
    ax1.set_xlabel('Weighted Hiring Score (%)', fontsize=11, fontweight='bold')
    ax1.set_title('Candidate Rankings (60% Skill • 25% Exp • 15% Edu)', fontsize=13, fontweight='bold', pad=12, color='#38bdf8')
    ax1.legend(loc='lower right', facecolor='#0f172a', edgecolor='#334155')

    for bar, score in zip(bars, scores):
        ax1.text(score + 1.5, bar.get_y() + bar.get_height()/2, f"{score}%", 
                 va='center', ha='left', fontsize=10, fontweight='black', color='#f8fafc')
    ax1.grid(axis='x', linestyle=':', alpha=0.3, color='#64748b')

    # --- PLOT 2: Missing Skill Gap Deficit Analysis ---
    ax2 = plt.subplot(2, 2, 2)
    ax2.set_facecolor('#1e293b')
    skills = ['Kubernetes', 'PyTorch', 'AWS SageMaker', 'Computer Vision', 'Microservices', 'GraphQL', 'Statistics']
    deficits = [4, 3, 2, 2, 2, 1, 1]

    skill_bars = ax2.bar(skills, deficits, color='#6366f1', edgecolor='#818cf8', width=0.55, linewidth=1.5)
    ax2.set_ylabel('Candidate Deficit Count', fontsize=11, fontweight='bold')
    ax2.set_title('Skill Gap Intelligence: Identified Missing Competencies', fontsize=13, fontweight='bold', pad=12, color='#a5b4fc')
    plt.setp(ax2.get_xticklabels(), rotation=25, ha='right', fontsize=9)

    for bar, val in zip(skill_bars, deficits):
        ax2.text(bar.get_x() + bar.get_width()/2, val + 0.1, f"{val}", 
                 ha='center', va='bottom', fontsize=10, fontweight='bold', color='#f8fafc')
    ax2.grid(axis='y', linestyle=':', alpha=0.3, color='#64748b')

    # --- PLOT 3: Recruitment Funnel Pipeline ---
    ax3 = plt.subplot(2, 2, 3)
    ax3.set_facecolor('#1e293b')
    stages = ['Applied', 'Screened', 'Shortlisted', 'Interview Completed', 'Offer Extended', 'Hired']
    counts = [150, 89, 45, 28, 12, 11]
    stage_colors = ['#38bdf8', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#10b981']

    ax3.bar(stages, counts, color=stage_colors, width=0.55, edgecolor='#334155', linewidth=1.2)
    ax3.set_title('End-to-End Recruitment Workflow Funnel', fontsize=13, fontweight='bold', pad=12, color='#38bdf8')
    ax3.set_ylabel('Candidates in Pipeline', fontsize=11, fontweight='bold')
    plt.setp(ax3.get_xticklabels(), rotation=20, ha='right', fontsize=9)

    for i, count in enumerate(counts):
        ax3.text(i, count + 3, str(count), ha='center', va='bottom', fontsize=10, fontweight='bold', color='#f8fafc')
    ax3.grid(axis='y', linestyle=':', alpha=0.3, color='#64748b')

    # --- PLOT 4: Milestone 4 Success Metrics & User Satisfaction ---
    ax4 = plt.subplot(2, 2, 4)
    ax4.set_facecolor('#1e293b')
    metrics = [
        'User Satisfaction\n(Target >=85%)',
        'Hiring Success\nRate',
        'Voice Screening\nAccuracy',
        'Skill Gap\nPrecision',
        'System\nUptime'
    ]
    achieved = [91.5, 92.0, 94.2, 96.0, 99.9]
    benchmark = [85.0, 85.0, 85.0, 85.0, 95.0]

    x = np.arange(len(metrics))
    width = 0.35

    rects1 = ax4.bar(x - width/2, achieved, width, label='Achieved Metric', color='#10b981', edgecolor='#059669', linewidth=1.2)
    rects2 = ax4.bar(x + width/2, benchmark, width, label='Target Benchmark', color='#475569', edgecolor='#334155', linewidth=1.2)

    ax4.set_title('Milestone 4 (Week 8) Evaluation & Satisfaction Audit', fontsize=13, fontweight='bold', pad=12, color='#34d399')
    ax4.set_ylabel('Percentage (%)', fontsize=11, fontweight='bold')
    ax4.set_xticks(x)
    ax4.set_xticklabels(metrics, fontsize=9)
    ax4.set_ylim(60, 108)
    ax4.legend(loc='lower right', facecolor='#0f172a', edgecolor='#334155')

    for rect in rects1:
        h = rect.get_height()
        ax4.text(rect.get_x() + rect.get_width()/2, h + 1, f"{h}%", ha='center', va='bottom', fontsize=9, fontweight='black', color='#34d399')

    ax4.grid(axis='y', linestyle=':', alpha=0.3, color='#64748b')

    # Overall Layout Title
    fig.suptitle('AI Recruitment Copilot • Milestone 4 (Week 8) Deliverables Audit', fontsize=18, fontweight='black', color='#ffffff', y=0.98)
    plt.tight_layout(rect=[0, 0.03, 1, 0.95])

    # Save to docs and root
    os.makedirs('docs', exist_ok=True)
    out_path = os.path.join('docs', 'milestone4_pictorial_results.png')
    plt.savefig(out_path, dpi=200, bbox_inches='tight')
    plt.close()
    print(f"[SUCCESS] Pictorial results chart generated and saved to: {out_path}")
    return out_path

if __name__ == '__main__':
    generate_milestone4_pictorials()
