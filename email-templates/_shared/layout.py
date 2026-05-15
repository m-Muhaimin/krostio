#!/usr/bin/env python3
"""
Krost email template generator.
Run: python layout.py [--out supabase_dir transactional_dir]
Generates all 13 branded email templates from shared design-system tokens.
Edit this file to change shared design decisions; re-run to regenerate all.
"""

import os
import sys
from pathlib import Path

# ── Brand config ────────────────────────────────────────────────────────────────

BRAND_NAME    = "Krost"
BRAND_DOMAIN  = "krost.xyz"
BRAND_URL     = f"https://{BRAND_DOMAIN}"
BRAND_EMAIL   = "hello@krost.xyz"

# Design tokens (Cohere-inspired — mirrors src/app/globals.css)
INK_BLACK     = "#17171c"
CORAL         = "#ff7759"
SOFT_STONE    = "#eeece7"
BORDER_CLR    = "#d9d9dd"
MUTED         = "#93939f"
WHITE         = "#ffffff"
ERROR_RED     = "#b30000"
SUCCESS_GREEN = "#006633"
FONT_DISPLAY  = "'Space Grotesk', Arial, sans-serif"
FONT_SANS     = "'Inter', Arial, sans-serif"
FONT_MONO     = "'JetBrains Mono', 'Courier New', monospace"
EMAIL_WIDTH   = 600
RAD           = 6   # email-safe border-radius (no Outlook rounding support)

# ── Utilities ─────────────────────────────────────────────────────────────────

def e(text):
    """HTML-escape."""
    return (str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;"))

def s(**kwargs):
    """Build inline style string from kwargs.  Keys are CSS property names (dashes → underscores)."""
    return "; ".join(
        k.replace("_", "-") + ": " + str(v) for k, v in kwargs.items() if v
    )

def tag(name, content, **attrs):
    """HTML tag builder.  style attr accepted as **kwargs dict."""
    style = attrs.pop("style", None)
    pairs = " ".join(f'{k}="{e(str(v))}"' for k, v in attrs.items())
    if style is not None:
        pairs += f' style="{s(**style) if isinstance(style, dict) else e(str(style))}"'
    return f"<{name} {pairs}>{content}</{name}>"

# ── Logo SVG (inline, no external requests) ──────────────────────────────────

BRAND_LOGO_SVG = (Path(__file__).parent.parent.parent / "media" / "logo.svg").read_text(encoding="utf-8")

# ── Reusable body components ───────────────────────────────────────────────────

def hero_heading(text):
    return tag("h1", text, style={
        "font-family": FONT_DISPLAY,
        "font-size": "36px",
        "font-weight": "400",
        "letter-spacing": "-0.02em",
        "line-height": "1.1",
        "color": INK_BLACK,
        "margin": "0 0 24px",
    })

def para(text, color=None, size="17px", line_height="1.6", mt="0 0 16px"):
    return tag("p", text, style=s(
        font_family=FONT_SANS, font_size=size, line_height=line_height,
        color=color or MUTED, margin=mt,
    ))

def divider():
    return tag("hr", "", style=s(border="none", border_top=f"1px solid {BORDER_CLR}", margin="28px 0"))

def mono_label(text, color=None):
    return tag("p", text, style=s(
        font_family=FONT_MONO, font_size="11px", color=color or MUTED,
        letter_spacing="0.08em", text_transform="uppercase", margin="0",
    ))

def cta_btn(text, href, bg=INK_BLACK, fg=WHITE):
    outer = tag("table", "", role="presentation", cellpadding="0", cellspacing="0",
                style=s(border_collapse="collapse", margin="24px 0 0"))
    inner = tag("a", text, href=href, style=s(
        display="inline-block", background_color=bg, color=fg,
        font_family=FONT_SANS, font_size="14px", font_weight="500",
        padding="13px 28px", text_decoration="none", border_radius=f"{RAD}px",
    ))
    return outer + inner

def score_card(score, label, bar_pct, bar_color=CORAL):
    return tag("div", (
        mono_label(label) +
        tag("p", str(score), style=s(
            font_family=FONT_DISPLAY, font_size="64px", font_weight="400",
            letter_spacing="-0.02em", color=INK_BLACK, margin="8px 0 16px", line_height="1",
        )) +
        tag("div", tag("div", "", style=s(width=bar_pct, height="6px",
                   background_color=bar_color, border_radius=f"{RAD}px")),
             style=s(background_color=BORDER_CLR, border_radius=f"{RAD}px",
                     height="6px", overflow="hidden"))
    ), style=s(background_color=SOFT_STONE, border_radius=f"{RAD}px",
                padding="24px", margin="24px 0", text_align="center"))

def meta_row(key, val, mono=False):
    vs = s(font_family=FONT_MONO if mono else FONT_SANS,
           font_size="13px", font_weight="500" if not mono else "400",
           color=INK_BLACK, margin="0")
    row = (
        tag("td", tag("p", key, style=s(font_family=FONT_SANS, font_size="13px",
                  color=MUTED, margin="0")),
            style=s(padding="8px 0", border_bottom="1px solid #f2f2f2", width="50%")) +
        tag("td", tag("p", val, style=vs),
            style=s(padding="8px 0", border_bottom="1px solid #f2f2f2", text_align="right"),
            align="right")
    )
    return tag("tr", row)

def step(num, title, desc):
    num_cell = tag("td", tag("span", f"{num:02d}", style=s(
        font_family=FONT_MONO, font_size="11px", color=CORAL)),
        style=s(width="36px", vertical_align="top", padding_right="16px", padding_top="2px"))
    text_cell = tag("td", tag("p", title, style=s(
        font_family=FONT_DISPLAY, font_size="16px", font_weight="500",
        color=INK_BLACK, margin="0 0 4px")) +
        tag("p", desc, style=s(font_family=FONT_SANS, font_size="14px",
                  color=MUTED, margin="0", line_height="1.5")),
        style=s(padding_bottom="20px"))
    return tag("tr", num_cell + text_cell)

def steps_table(*rows):
    body = "".join(rows)
    return tag("table", tag("tbody", body), role="presentation",
                width="100%", cellpadding="0", cellspacing="0",
                style=s(border_collapse="collapse", margin="24px 0"))

def alert_box(text, bg="#fff5f5", border_color="#ffcccc", text_color=ERROR_RED):
    return tag("div", tag("p", text, style=s(
        font_family=FONT_SANS, font_size="13px", color=text_color, margin="0", font_weight="500")),
        style=s(background_color=bg, border_radius=f"{RAD}px", padding="20px",
                 margin="24px 0", border=f"1px solid {border_color}"))

def receipt_table(*meta_rows_html):
    rows = "".join(meta_rows_html)
    return tag("div", (
        tag("p", "RECEIPT", style=s(font_family=FONT_SANS, font_size="13px",
                  color=MUTED, margin="0 0 16px")) +
        tag("table", tag("tbody", rows), role="presentation",
            width="100%", cellpadding="0", cellspacing="0",
            style=s(border_collapse="collapse"))
    ), style=s(background_color=SOFT_STONE, border_radius=f"{RAD}px", padding="28px", margin="24px 0"))

def lender_request_card(lender_name, fields_list, request_id):
    fields_str = ", ".join(fields_list) if fields_list else "Krost Score (verified income summary)"
    inner = (
        tag("p", f"Request from: {e(lender_name)}", style=s(
            font_family=FONT_DISPLAY, font_size="14px", font_weight="500",
            color=INK_BLACK, margin="0 0 8px")) +
        tag("p", f"Fields: {fields_str}", style=s(
            font_family=FONT_SANS, font_size="13px", color=MUTED, margin="0 0 8px")) +
        tag("p", f"Request ID: {request_id}", style=s(
            font_family=FONT_MONO, font_size="12px", color=MUTED, margin="0"))
    )
    return tag("div", inner, style=s(background_color=SOFT_STONE, border_radius=f"{RAD}px",
                                      padding="24px", margin="24px 0"))

# ── Email shell ────────────────────────────────────────────────────────────────

def email_shell(title, preview_text, body_html, dark=False, foot_note=None):
    bg = INK_BLACK if dark else WHITE

    footer = ""
    if foot_note:
        footer = tag("p", foot_note, style=s(
            font_family=FONT_SANS, font_size="12px", color=MUTED,
            text_align="center", padding_top="24px",
            border_top=f"1px solid {BORDER_CLR}", margin_top="32px", line_height="1.6"))

    copyright_footer = tag("p", (
        f"&copy; 2026 {BRAND_NAME}. Built on Base L2.<br/>"
        f"You received this because you have an account at {BRAND_DOMAIN}.<br/>"
        f'<a href="{BRAND_URL}" style="color:{MUTED}; text-decoration:none">{BRAND_URL}</a>'
    ), style=s(font_family=FONT_SANS, font_size="12px", color=MUTED,
                text_align="center", line_height="1.6", margin="0"))

    # Header row
    header = (
        tag("td",
            tag("table",
                tag("tr",
                    tag("td",
                        tag("a", BRAND_LOGO_SVG, href=BRAND_URL,
                            style=s(display="inline-block", text_decoration="none")),
                        align="left") +
                    tag("td",
                        tag("span", BRAND_NAME, style=s(
                            font_family=FONT_SANS, font_size="13px", color=MUTED)),
                        align="right", style=s(padding_top="4px")),
                    ),
                role="presentation", width="100%", cellpadding="0", cellspacing="0",
                style=s(border_collapse="collapse")),
            style=s(padding="32px 40px 24px", border_bottom=f"1px solid {BORDER_CLR}"))
    )

    # Body row
    body_cell = tag("td",
        tag("div", body_html, class_="mobile-padding"),
        style=s(padding="48px 40px", background_color=WHITE))

    # Footer row
    footer_cell = tag("td",
        tag("div", footer + copyright_footer, style=s(padding=f"0 40px 40px", background_color=WHITE)),
        style=s(padding="0"))

    inner_table = (
        tag("table",
            tag("tbody",
                tag("tr", header) +
                tag("tr", body_cell) +
                tag("tr", footer_cell),
            ),
            role="presentation", width="100%", cellpadding="0", cellspacing="0",
            style=s(border_collapse="collapse", max_width=EMAIL_WIDTH, width=EMAIL_WIDTH,
                    background_color=WHITE),
            class_="email-container")
    )

    outer = tag("table",
        tag("tr",
            tag("td",
                inner_table,
                align="center", style=s(padding="0")),
        ),
        role="presentation", width="100%", cellpadding="0", cellspacing="0",
        style=s(border_collapse="collapse", background_color=bg))

    # Preheader (hidden)
    preheader = tag("div",
        f"&#9993;&#65039; {e(preview_text)} &zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;",
        style=s(display="none", max_height="0", overflow="hidden"))

    fonts = (
        '<link rel="preconnect" href="https://fonts.googleapis.com"/>'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>'
        '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500'
        '&family=Inter:wght@400;450;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet"/>'
    )

    return (
        f'<!DOCTYPE html>\n'
        f'<html lang="en" xmlns="http://www.w3.org/1999/xhtml"'
        f' xmlns:v="urn:schemas-microsoft-com:vml">\n'
        f'<head>\n'
        f'  <meta charset="utf-8"/>\n'
        f'  <meta name="viewport" content="width=device-width, initial-scale=1"/>\n'
        f'  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>\n'
        f'  <title>{e(title)}</title>\n'
        f'  <!--[if mso]><xml><o:OfficeDocumentSettings>'
        f'<o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch>'
        f'</o:OfficeDocumentSettings></xml><![endif]-->\n'
        f'  {fonts}\n'
        f'  <style>\n'
        f'    body {{ margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }}\n'
        f'    table {{ border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }}\n'
        f'    img {{ -ms-interpolation-mode:bicubic; border:0; display:block; }}\n'
        f'    a {{ color:{CORAL}; }}\n'
        f'    @media only screen and (max-width:620px) {{\n'
        f'      .email-container {{ width:100% !important; max-width:100% !important; }}\n'
        f'      .mobile-padding {{ padding-left:20px !important; padding-right:20px !important; }}\n'
        f'      .mobile-center {{ text-align:center !important; }}\n'
        f'    }}\n'
        f'  </style>\n'
        f'</head>\n'
        f'<body style="margin:0; padding:0; background-color:{bg}; font-family:{FONT_SANS};">\n'
        f'{preheader}\n'
        f'{outer}\n'
        f'</body>\n'
        f'</html>'
    )


# ══════════════════════════════════════════════════════════════════════════════
# TEMPLATE FUNCTIONS
# Each returns plain HTML string ready to send or save.
# ══════════════════════════════════════════════════════════════════════════════

# ── Supabase auth ──────────────────────────────────────────────────────────────

def render_confirm_signup(confirmation_url):
    body = (
        hero_heading("Confirm your email") +
        para(f"You're one click away from joining {BRAND_NAME}. "
             "Click the button below to verify your email address and activate your account.") +
        cta_btn("Confirm email address", confirmation_url) +
        divider() +
        para(f"If you didn't create an account with {BRAND_NAME}, you can safely ignore this email. "
             "This link expires in 1 hour.",
             color=MUTED, size="14px", mt="0") +
        para(f'<span style="font-family:{FONT_MONO}; font-size:12px; color:{MUTED}">'
             f"Confirmation URL: {e(confirmation_url)}</span>",
             color=MUTED, size="12px", mt="0")
    )
    return email_shell(
        title=f"Confirm your email — {BRAND_NAME}",
        preview_text=f"Confirm your email to activate your {BRAND_NAME} account.",
        body_html=body,
    )


def render_invite(invitation_url):
    body = (
        hero_heading("You've been invited") +
        para(f"You've received an invitation to join {BRAND_NAME}. "
             "Click the button below to accept and get started.") +
        cta_btn("Accept invitation", invitation_url) +
        divider() +
        para("This invitation link expires in 7 days. "
             "If you didn't expect this email, you can safely ignore it.",
             color=MUTED, size="14px", mt="0")
    )
    return email_shell(
        title=f"You've been invited — {BRAND_NAME}",
        preview_text=f"Accept your invitation to join {BRAND_NAME}.",
        body_html=body,
    )


def render_magic_link(magic_link_url):
    body = (
        hero_heading("Your magic sign-in link") +
        para("Click the button below to sign in to your account instantly. No password needed.") +
        cta_btn("Sign in to Krost", magic_link_url) +
        divider() +
        para("This link expires in 1 hour and can only be used once. "
             "If you didn't request this, you can safely ignore this email.",
             color=MUTED, size="14px", mt="0")
    )
    return email_shell(
        title=f"Sign in to {BRAND_NAME}",
        preview_text=f"Your magic sign-in link for {BRAND_DOMAIN}.",
        body_html=body,
    )


def render_change_email(change_email_url):
    body = (
        hero_heading("Confirm your new email") +
        para(f"You requested to change your email address on {BRAND_NAME}. "
             "Click below to confirm this change. Your email will be updated after confirmation.") +
        cta_btn("Confirm new email", change_email_url) +
        divider() +
        para("This link expires in 1 hour. If you didn't request this change, contact us "
             f"immediately at <a href='mailto:{BRAND_EMAIL}' style='color:{CORAL}'>{BRAND_EMAIL}</a>.",
             color=MUTED, size="14px", mt="0")
    )
    return email_shell(
        title=f"Confirm your new email — {BRAND_NAME}",
        preview_text=f"Confirm your new email address for {BRAND_DOMAIN}.",
        body_html=body,
    )


def render_reset_password(reset_url):
    body = (
        hero_heading("Reset your password") +
        para(f"We received a request to reset the password for your {BRAND_NAME} account. "
             "Click the button below to choose a new password. "
             "If you didn't request this, your account is secure — just ignore this email.") +
        cta_btn("Reset password", reset_url) +
        divider() +
        para("This link expires in 1 hour and can only be used once. "
             "For security, we never ask for your password via email.",
             color=MUTED, size="14px", mt="0") +
        para(f'<span style="font-family:{FONT_MONO}; font-size:12px; color:{MUTED}">'
             f"Reset URL: {e(reset_url)}</span>",
             color=MUTED, size="12px", mt="0")
    )
    return email_shell(
        title=f"Reset your password — {BRAND_NAME}",
        preview_text=f"Reset your password for {BRAND_DOMAIN}.",
        body_html=body,
    )


def render_reauthentication(token):
    body = (
        hero_heading("Confirm this action") +
        para(f"You're performing a sensitive action on your {BRAND_NAME} account. "
             "Enter the code below to confirm it's you:") +
        tag("div",
            tag("span", token, style=s(
                font_family=FONT_MONO, font_size="32px", font_weight="500",
                color=INK_BLACK, letter_spacing="0.1em",
                background_color=SOFT_STONE, padding="16px 32px",
                border_radius=f"{RAD}px", display="inline-block")),
            style=s(text_align="center", margin="32px 0")) +
        para("This code expires in 10 minutes and can only be used once. "
             f"If you didn't attempt this action, contact us at "
             f"<a href='mailto:{BRAND_EMAIL}' style='color:{CORAL}'>{BRAND_EMAIL}</a>.",
             color=MUTED, size="14px", mt="0")
    )
    return email_shell(
        title=f"Confirm this action — {BRAND_NAME}",
        preview_text=f"Confirmation code for your {BRAND_DOMAIN} account.",
        body_html=body,
    )


# ── Transactional ─────────────────────────────────────────────────────────────

def render_welcome(name, dashboard_url):
    first = name.split()[0] if name else "there"
    body = (
        hero_heading(f"Welcome, {e(first)}.") +
        para(f"60 million Americans work gig jobs. Banks reject them because they can't "
             "see W-2s. Krost fixes that.") +
        para("You've got a Krost Score waiting to be built. Here's how to get started:") +
        steps_table(
            step(1, "Connect your platforms",
                 "Link Uber, DoorDash, Upwork, and 12 more via secure read-only OAuth."),
            step(2, "We compute your score",
                 "Our scoring engine analyzes 12 months of income across all platforms."),
            step(3, "Share with lenders",
                 "One signed URL. Lenders verify your score on-chain in seconds."),
        ) +
        cta_btn("Connect your first platform", dashboard_url) +
        para("Your first attestation on Base L2 is waiting.", color=INK_BLACK, size="15px", mt="24px 0 0")
    )
    return email_shell(
        title=f"Welcome to {BRAND_NAME} — your score is ready to build",
        preview_text=f"Connect your gig platforms and build your Krost Score.",
        body_html=body,
        foot_note=f"Questions? Reply to this email or visit {BRAND_URL}/help",
    )


def render_waitlist_confirmation(email, report_url, score_estimate=None):
    first = email.split("@")[0]
    bar_pct = f"{int(score_estimate / 8.5)}%" if score_estimate else "50%"
    body = (
        hero_heading("You're on the list.") +
        para(f"Welcome, {e(first)}. You're now on the {BRAND_NAME} waitlist — "
             "and your free Gig Worker Credit Report is ready below.") +
        para("This report shows you exactly what lenders see when they evaluate gig income. "
             "It's the same data your score will be built from.") +
        score_card(
            score=str(score_estimate) if score_estimate else "—",
            label="Your estimated Krost Score" if score_estimate else "Score pending",
            bar_pct=bar_pct,
        ) +
        cta_btn("Get your full report", report_url) +
        para("Your free 12-page report covers: your Krost Score (300-850), 12-month verified income, "
             "consistency analysis, and the lenders currently piloting Krost attestations.",
             color=MUTED, size="14px", mt="24px 0 0") +
        divider() +
        para("We'll email you when early access opens. You have lifetime free attestations at launch.",
             color=INK_BLACK, size="15px", mt="0")
    )
    return email_shell(
        title="You're on the list — your free report is ready",
        preview_text="Your free Gig Worker Credit Report is waiting.",
        body_html=body,
        foot_note="You're receiving this because you signed up at krost.xyz/join. "
        f"Questions? Email {BRAND_EMAIL}.",
    )


def render_score_ready(name, score, previous_score, score_change, dashboard_url):
    first = name.split()[0] if name else "there"
    direction = ("+" if score_change > 0 else ("-" if score_change < 0 else ""))
    body = (
        hero_heading(f"Your score is ready.") +
        para(f"Hi {e(first)} — Krost just finished analyzing your gig income "
             "across all connected platforms. Here's your result:") +
        score_card(score=str(score), label="Your Krost Score", bar_pct=f"{int(score / 8.5)}%") +
        receipt_table(
            meta_row("Previous score", str(previous_score) if previous_score else "—"),
            meta_row("Change", f"{direction}{abs(score_change)} pts"),
            meta_row("Range", "300 – 850"),
            meta_row("Attestation", "Published on Base L2 ✓", mono=True),
        ) +
        para("Your score is now attested on Base L2. Any lender can verify it in seconds "
             "without ever seeing your raw earnings data.") +
        cta_btn("View your full report", dashboard_url)
    )
    return email_shell(
        title=f"Your Krost Score is {score}",
        preview_text=f"Your Krost Score is ready: {score}.",
        body_html=body,
        foot_note="This score was computed from data shared via Plaid & OAuth. "
        f"You can revoke access at any time at {BRAND_URL}/dashboard/settings.",
    )


def render_lender_request(name, lender_name, requested_fields, request_id, approve_url, deny_url):
    first = name.split()[0] if name else "there"
    body = (
        hero_heading(f"{e(lender_name)} wants to verify you.") +
        para(f"Hi {e(first)} — {e(lender_name)} has sent a secure verification request "
             f"through {BRAND_NAME}. They want to check your Krost Score and income attestation.") +
        lender_request_card(lender_name, requested_fields, request_id) +
        para("You stay in control — lenders only see your score and attestation hash, "
             "never your raw earnings. Approve or deny below:",
             color=MUTED, size="15px") +
        cta_btn("Approve request", approve_url, bg=CORAL, fg=WHITE) +
        tag("br", "") +
        cta_btn("Deny request", deny_url, bg="transparent", fg=INK_BLACK) +
        para("This request expires in 7 days. Unapproved requests are automatically denied.",
             color=MUTED, size="13px", mt="20px 0 0")
    )
    return email_shell(
        title=f"A lender wants to verify your score",
        preview_text=f"{lender_name} sent you a verification request.",
        body_html=body,
        foot_note="You can manage all lender requests in your "
        f"{BRAND_URL}/dashboard/worker/connections dashboard.",
    )


def render_lender_approved(name, lender_name, score, share_url):
    first = name.split()[0] if name else "there"
    body = (
        hero_heading(f"{e(first)} approved your request.") +
        para(f"{e(name)} has approved your verification request and their Krost Score "
             "is now available for your review.") +
        score_card(score=str(score), label="Verified Krost Score", bar_pct=f"{int(score / 8.5)}%") +
        receipt_table(
            meta_row("Attestation hash", "0xa1f2…7c4b (verifiable on-chain)", mono=True),
            meta_row("Verified worker", name),
        ) +
        cta_btn("View full attestation", share_url)
    )
    return email_shell(
        title=f"{name} approved your verification request",
        preview_text=f"View {first}'s verified Krost Score.",
        body_html=body,
    )


def render_payment_receipt(email, amount, currency, invoice_id, description, receipt_url, next_billing_date):
    amount_str = f"{currency.upper()} {float(amount):.2f}"
    body = (
        hero_heading("Payment received.") +
        para(f"Thank you, {e(email.split('@')[0])}. Your payment of {amount_str} has been "
             f"processed and your {BRAND_NAME} subscription is now active.") +
        receipt_table(
            meta_row("Description", description),
            meta_row("Amount charged", amount_str),
            meta_row("Invoice ID", invoice_id, mono=True),
            meta_row("Next billing date", next_billing_date),
        ) +
        para("A full receipt has been sent to your billing email. "
             "You can manage or cancel your subscription at any time:",
             color=MUTED, size="15px") +
        cta_btn("Manage subscription", receipt_url)
    )
    return email_shell(
        title=f"Receipt for your {BRAND_NAME} payment — {amount_str}",
        preview_text=f"Payment of {amount_str} received. Your receipt is ready.",
        body_html=body,
        foot_note=f"Invoice ID: {invoice_id}. Questions about this charge? Contact {BRAND_EMAIL}.",
    )


def render_payment_failed(email, amount, currency, invoice_id, failure_reason, retry_url):
    amount_str = f"{currency.upper()} {float(amount):.2f}"
    body = (
        hero_heading("Payment failed.") +
        para(f"Hi {e(email.split('@')[0])} — we couldn't process your subscription payment "
             f"of {amount_str}. Your account is still active, but we need to retry to keep it that way.") +
        alert_box(f"Reason: {e(failure_reason)}") +
        para("No action is needed right now — we'll automatically retry in 3 days. "
             "Or update your payment method now to avoid any interruption:",
             color=MUTED, size="15px") +
        cta_btn("Update payment method", retry_url, bg=ERROR_RED, fg=WHITE) +
        para(f"Invoice: {invoice_id}. If you need help, reply to this email or "
             f"contact {BRAND_EMAIL}.",
             color=MUTED, size="13px", mt="20px 0 0")
    )
    return email_shell(
        title="Your payment couldn't be processed — action needed",
        preview_text=f"Payment of {amount_str} failed. Update your payment method.",
        body_html=body,
        foot_note="Your subscription remains active during the retry window. "
        "We will not charge your account without your explicit update.",
    )


# ── Generator driver ──────────────────────────────────────────────────────────

SUPABASE_TEMPLATES = [
    # Supabase replaces these handlebars variables at send time.
    # Supabase Dashboard → Authentication → Email Templates → paste each file.
    ("confirm-signup.html",
     lambda: render_confirm_signup("{{ .ConfirmationURL }}")),
    ("invite.html",
     lambda: render_invite("{{ .ConfirmationURL }}")),
    ("magic-link.html",
     lambda: render_magic_link("{{ .ConfirmationURL }}")),
    ("change-email.html",
     lambda: render_change_email("{{ .ConfirmationURL }}")),
    ("reset-password.html",
     lambda: render_reset_password("{{ .ConfirmationURL }}")),
    ("reauthentication.html",
     # No URL — Supabase sends the token directly via email.
     lambda: render_reauthentication("{{ .Token }}")),
]

TRANSACTIONAL_TEMPLATES = [
    ("welcome.html",                lambda: render_welcome("Jordan Rivera", "https://krost.xyz/dashboard")),
    ("waitlist-confirmation.html",  lambda: render_waitlist_confirmation("jordan@example.com", "https://krost.xyz/join/report", score_estimate=724)),
    ("score-ready.html",            lambda: render_score_ready("Jordan Rivera", 724, None, 0, "https://krost.xyz/dashboard/worker/score")),
    ("lender-request.html",         lambda: render_lender_request("Jordan Rivera", "Neon Financial", ["Krost Score (300-850)", "12-mo verified income"], "req_8f2a1c", "https://krost.xyz/dashboard/worker/connections?action=approve", "https://krost.xyz/dashboard/worker/connections?action=deny")),
    ("lender-approved.html",        lambda: render_lender_approved("Jordan Rivera", "Neon Financial", 724, "https://krost.xyz/verify/attestation")),
    ("payment-receipt.html",        lambda: render_payment_receipt("jordan@example.com", "29.00", "usd", "in_9K2mx7bZq3nL4p", "Krost Pro — monthly", "https://krost.xyz/dashboard/billing", "June 15, 2026")),
    ("payment-failed.html",         lambda: render_payment_failed("jordan@example.com", "29.00", "usd", "in_9K2mx7bZq3nL4p", "Card declined — insufficient funds", "https://krost.xyz/dashboard/billing")),
]

def main():
    script_dir = Path(__file__).parent.resolve()
    supabase_dir = script_dir.parent / "supabase"
    transactional_dir = script_dir.parent / "transactional"

    if len(sys.argv) >= 3:
        supabase_dir = Path(sys.argv[1]).resolve()
        transactional_dir = Path(sys.argv[2]).resolve()

    supabase_dir.mkdir(parents=True, exist_ok=True)
    transactional_dir.mkdir(parents=True, exist_ok=True)

    total = 0
    for fname, render_fn in SUPABASE_TEMPLATES:
        out = supabase_dir / fname
        out.write_text(render_fn(), encoding="utf-8")
        print(f"  [supabase]       {out.relative_to(script_dir.parent)}")
        total += 1

    for fname, render_fn in TRANSACTIONAL_TEMPLATES:
        out = transactional_dir / fname
        out.write_text(render_fn(), encoding="utf-8")
        print(f"  [transactional] {out.relative_to(script_dir.parent)}")
        total += 1

    print(f"\n✓ {total} templates generated.")


if __name__ == "__main__":
    main()
