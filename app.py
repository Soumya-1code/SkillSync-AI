"""SkillSync AI: local-first resume analysis and job alignment."""
from __future__ import annotations

import streamlit as st

from src.anonymizer import anonymize
from src.extractor import ResumeData, extract_resume
from src.integrity_checker import inspect_pdf
from src.skill_matcher import match_job
from src.utils import format_bytes

st.set_page_config(page_title="SkillSync AI", page_icon="✦", layout="wide", initial_sidebar_state="expanded")

st.markdown("""
<style>
:root { --ink:#17213b; --muted:#68728a; --lav:#8068d9; --pale:#f3f0ff; --line:#e8eaf1; }
html, body, [class*="css"] { font-family:'DM Sans',sans-serif; color:var(--ink); }
.stApp { background:linear-gradient(180deg,#faf9ff 0,#fff 340px); }
[data-testid="stSidebar"] { background:#f7f5ff; border-right:1px solid #ebe8f5; }
[data-testid="stSidebar"] h1 { font-family:Manrope,sans-serif; color:#2a2450; font-size:1.25rem; }
h1,h2,h3 { font-family:Manrope,sans-serif; letter-spacing:-.025em; color:#202947; }
.hero { padding:2rem 2.2rem; background:linear-gradient(110deg,#f3f0ff 0%,#fff 72%); border:1px solid #e8e2fa; border-radius:22px; margin-bottom:1.4rem; }
.eyebrow { color:#725bbf; text-transform:uppercase; letter-spacing:.13em; font-weight:700; font-size:.72rem; }
.hero h1 { font-size:2.35rem; margin:.4rem 0 .35rem; }
.hero p { color:#68728a; font-size:1.04rem; margin:0; }
.panel { border:1px solid var(--line); border-radius:16px; background:white; padding:1.1rem 1.25rem; }
.small-muted { color:#68728a; font-size:.9rem; }
div[data-testid="stMetric"] { background:#fff; padding:1rem; border:1px solid var(--line); border-radius:14px; }
.stButton>button { border-radius:10px; font-weight:600; }
@media(max-width:700px){ .hero{padding:1.4rem}.hero h1{font-size:1.8rem} }
</style>
""", unsafe_allow_html=True)

with st.sidebar:
    st.markdown("# ✦ SkillSync AI")
    st.caption("Understand skills. Reveal potential.")
    page = st.radio("Workspace", ["Overview", "Resume analysis", "Job alignment", "Integrity review"], label_visibility="collapsed")
    st.divider()
    st.caption("🔒 Local-first analysis")
    st.caption("Files are processed in memory and not saved by this app.")

if "resume_data" not in st.session_state:
    st.session_state.resume_data = None
if "resume_filename" not in st.session_state:
    st.session_state.resume_filename = None
if "resume_bytes" not in st.session_state:
    st.session_state.resume_bytes = None
if "job_text" not in st.session_state:
    st.session_state.job_text = ""

def upload_panel() -> None:
    st.markdown("### Add a resume")
    upload = st.file_uploader("Choose a PDF or DOCX file", type=["pdf", "docx"], help="Your file is processed in memory and is not retained after the session.")
    if upload is not None and st.button("Analyze resume", type="primary", key="analyze_upload"):
        data = upload.getvalue()
        with st.spinner("Reading resume and organizing details…"):
            try:
                parsed = extract_resume(upload.name, data)
                st.session_state.resume_data = parsed
                st.session_state.resume_filename = upload.name
                st.session_state.resume_bytes = data
                st.success(f"Resume ready · {format_bytes(len(data))}")
            except (ValueError, RuntimeError) as exc:
                st.error(str(exc))

def show_profile(data: ResumeData, bias_blind: bool) -> None:
    view = anonymize(data) if bias_blind else data
    if bias_blind:
        st.info("Bias-blind view is an imperfect presentation layer. Some identifying clues may remain; review the original separately when appropriate.")
    st.markdown("### Candidate snapshot")
    a, b, c = st.columns(3)
    a.metric("Skills identified", len(view.skills))
    b.metric("Education entries", len(view.education))
    c.metric("Experience entries", len(view.experience))
    with st.container(border=True):
        st.markdown("**Contact**")
        st.write(f"Name: {view.name or 'Not confidently identified'}  ·  Email: {view.email or 'Not found'}  ·  Phone: {view.phone or 'Not found'}")
    st.markdown("#### Skills")
    st.write(" · ".join(view.skills) if view.skills else "No skills confidently identified. You can still review the extracted text below.")
    left, right = st.columns(2)
    with left:
        st.markdown("#### Education")
        if view.education: st.dataframe([vars(item) for item in view.education], width="stretch", hide_index=True)
        else: st.caption("No education entries identified.")
        st.markdown("#### Projects")
        if view.projects: st.dataframe([vars(item) for item in view.projects], width="stretch", hide_index=True)
        else: st.caption("No project entries identified.")
    with right:
        st.markdown("#### Work experience")
        if view.experience: st.dataframe([vars(item) for item in view.experience], width="stretch", hide_index=True)
        else: st.caption("No experience entries identified.")
        st.markdown("#### Certifications")
        st.write(" · ".join(view.certifications) if view.certifications else "No certifications identified.")
    if data.warnings:
        with st.expander("Extraction notes"):
            for warning in data.warnings: st.write(f"• {warning}")
    with st.expander("Preview extracted text"):
        preview = view.text if bias_blind else data.text
        st.text(preview[:15000] + ("\n…preview shortened" if len(preview) > 15000 else ""))

def header(kicker: str, title: str, sub: str) -> None:
    st.markdown(f'<section class="hero"><div class="eyebrow">{kicker}</div><h1>{title}</h1><p>{sub}</p></section>', unsafe_allow_html=True)

if page == "Overview":
    header("Career insight workspace", "Understand skills. Reveal potential.", "A thoughtful, explainable way to explore resume skills, job alignment, and document signals.")
    st.markdown("### Your workspace")
    cols = st.columns(3)
    cards = [("01 · Resume analysis", "Extract structured skills, education, projects, experience, and contact details."), ("02 · Job alignment", "Compare a resume with a job description and see the evidence behind the match."), ("03 · Integrity review", "Inspect PDF text for keyword patterns and formatting that may deserve review.")]
    for col, (title, body) in zip(cols, cards):
        with col:
            with st.container(border=True): st.markdown(f"#### {title}"); st.write(body)
    st.caption("A match score reflects the share of identified job skills present in the resume. It does not predict hiring outcomes.")
    upload_panel()
    if st.session_state.resume_data:
        st.divider()
        st.markdown(f"Current document: **{st.session_state.resume_filename}**")
        show_profile(st.session_state.resume_data, False)

elif page == "Resume analysis":
    header("Resume analysis", "A clearer picture of experience", "Structured extraction helps make a resume easier to review.")
    upload_panel()
    if st.session_state.resume_data:
        st.divider()
        st.markdown(f"**{st.session_state.resume_filename}**")
        bias = st.toggle("Bias-blind review", key="bias_blind_resume", help="Masks selected identity details in this presentation. It does not change your source document.")
        show_profile(st.session_state.resume_data, bias)

elif page == "Job alignment":
    header("Job alignment", "Connect skills to opportunity", "See where an identified skill requirement appears in the resume and where development may help.")
    if not st.session_state.resume_data:
        st.info("Upload and analyze a resume from the Overview or Resume analysis page to get started.")
        upload_panel()
    else:
        bias = st.toggle("Bias-blind review", key="bias_blind_match", help="Uses a masked presentation of the resume; the comparison still uses its identified skills.")
        if bias: st.info("Bias-blind view is imperfect and cannot remove every source of bias.")
        st.text_area("Job description", key="job_text", height=220, placeholder="Paste the job description here…")
        if st.button("Compare skills", type="primary"):
            result = match_job(st.session_state.resume_data, st.session_state.job_text)
            st.session_state.match_result = result
        result = st.session_state.get("match_result")
        if result:
            if not result.requirements:
                st.warning("No identifiable skill requirements were found. A reliable alignment score cannot be calculated.")
            else:
                m1,m2,m3 = st.columns(3)
                m1.metric("Alignment", f"{result.score}%")
                m2.metric("Matched", len(result.matched))
                m3.metric("To explore", len(result.missing))
                st.caption("Score = matched identified skills ÷ all identified job skills. It is a simple baseline, not a hiring prediction.")
                left,right=st.columns(2)
                with left:
                    st.markdown("#### Matched skills")
                    if result.matched:
                        for skill in result.matched: st.write(f"✅ **{skill}** — {result.evidence[skill]}")
                    else: st.caption("No listed job skills were found in the resume.")
                with right:
                    st.markdown("#### Skills to develop or clarify")
                    if result.missing:
                        for skill in result.missing: st.write(f"○ **{skill}** — Consider building a project or adding relevant evidence if you have it.")
                    else: st.write("Every identified job skill matched.")

else:
    header("Integrity review", "Review document signals", "Findings are potentially suspicious and always need human review.")
    if not st.session_state.resume_data:
        st.info("Upload and analyze a resume to inspect it.")
        upload_panel()
    elif not st.session_state.resume_filename.lower().endswith(".pdf"):
        st.warning("PDF formatting inspection is available for PDF resumes. DOCX files are not inspected for hidden text by this tool.")
    else:
        terms = st.text_input("Keywords to count (comma-separated)", placeholder="Python, leadership, certification")
        if st.button("Inspect PDF", type="primary"):
            st.session_state.integrity_result = inspect_pdf(st.session_state.resume_bytes, [x.strip() for x in terms.split(",") if x.strip()])
        result = st.session_state.get("integrity_result")
        if result:
            st.caption("PDF analysis can miss cases. Repeated terms and light-colored text are not proof of cheating; inspect the source context.")
            if result.keyword_counts:
                st.markdown("#### Keyword occurrence counts")
                st.dataframe([{"Keyword": k, "Occurrences": v} for k,v in result.keyword_counts.items()], width="stretch", hide_index=True)
            st.markdown("#### Potentially suspicious findings")
            if result.findings:
                for item in result.findings:
                    st.warning(f"Page {item.page}: {item.reason}\n\nSnippet: “{item.snippet}”")
            else: st.success("No configured signal was found. This does not certify the document as authentic.")
