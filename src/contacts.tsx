import { useEffect, useState, type FormEvent } from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, LoaderCircle, Mail, Send, X } from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/i18n";
import AOS from "@/lib/aos/aos";
import "@/lib/aos/aos.css";

type ContactField = "name" | "email" | "topic" | "message";

export default function Contacts() {
  const { t } = useI18n();
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ContactField, string>>>({});

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      offset: 90,
      once: true,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);

  useEffect(() => {
    document.title = `${t("Contact")} | Baseline`;
  }, [t]);

  async function sendContactMessage(_details: { name: string; email: string; topic: string; message: string }) {
    // Simulate a short server response until the real endpoint is connected.
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    return { ok: true };
  }

  function clearFieldError(field: ContactField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    if (submissionStatus !== "idle") setSubmissionStatus("idle");
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const details = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      topic: String(formData.get("topic") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const nextErrors: Partial<Record<ContactField, string>> = {};
    if (!details.name.trim()) nextErrors.name = t("Please enter your name.");
    if (!details.email.trim()) nextErrors.email = t("Please enter your email address.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) nextErrors.email = t("Enter a valid email address.");
    if (!details.topic) nextErrors.topic = t("Choose a topic so we know what you’re reaching out about.");
    if (!details.message.trim()) nextErrors.message = t("Please add a message.");

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmissionStatus("idle");
      const firstInvalidField = Object.keys(nextErrors)[0] as ContactField;
      const firstInvalid = firstInvalidField === "topic"
        ? document.getElementById("contact-topic")
        : form.elements.namedItem(firstInvalidField);
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      return;
    }

    setSubmissionStatus("sending");
    try {
      const response = await sendContactMessage(details);
      if (!response.ok) throw new Error("Message submission failed");
      setSubmissionStatus("success");
    } catch {
      setSubmissionStatus("error");
    }
  }

  return (
    <main className="contacts-page">
      <SiteHeader />

      <section className="contacts-hero">
        <div className="contacts-hero-inner content-wrap">
          <h1 data-aos="zoom-in-up">{t("Work with us,")}<br />{t("or join us")}<span className="contacts-period">.</span></h1>
          <p className="contacts-lede" data-aos="fade-up" data-aos-delay="100">{t("One address reaches everyone in the collective — whether you want to build on something we've shipped, hand us a problem, or start contributing.")}</p>
          <p className="contacts-open-to" data-aos="fade-up" data-aos-delay="160"><strong>{t("Open to:")}</strong> {t("collaborations, contract work, open-source contributions, and people who want a real project to learn on.")}</p>
          <div className="contacts-actions" data-aos="fade-up" data-aos-delay="220">
            <a className="insight-card-contact contacts-email-pill" href="mailto:hello@ourbaseline.xyz">
              <span className="insight-card-contact-icon">
                <Mail className="insight-card-contact-arrow" aria-hidden="true" />
                <Check className="insight-card-contact-check" aria-hidden="true" />
              </span>
              <span className="insight-card-contact-label">{t("Get in Touch")}</span>
              <span className="insight-card-contact-email">hello@ourbaseline.xyz</span>
            </a>
          </div>
        </div>
      </section>

      <section className="contact-form-section content-wrap" aria-labelledby="contact-form-title">
        <div className="contact-form-intro" data-aos="fade-right">
          <h2 id="contact-form-title">{t("What are you")}<br />{t("working on?")}</h2>
        </div>
        <form className="contact-form" onSubmit={handleContactSubmit} noValidate data-aos="fade-up" data-aos-delay="100">
          <div className="contact-form-fields">
            <label data-aos="fade-up">{t("Name")}<input type="text" name="name" autoComplete="name" placeholder={t("Your name")} required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "contact-name-error" : undefined} onChange={() => clearFieldError("name")} />{fieldErrors.name && <span id="contact-name-error" className="contact-field-error">{fieldErrors.name}</span>}</label>
            <label data-aos="fade-up" data-aos-delay="60">{t("Email")}<input type="email" name="email" autoComplete="email" placeholder={t("Email placeholder")} required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "contact-email-error" : undefined} onChange={() => clearFieldError("email")} />{fieldErrors.email && <span id="contact-email-error" className="contact-field-error">{fieldErrors.email}</span>}</label>
            <div className="contact-form-topic" data-aos="fade-up" data-aos-delay="120">
              <label className="contact-form-topic-label" htmlFor="contact-topic">{t("What are you reaching out about?")}</label>
              <Select.Root name="topic" required onValueChange={() => clearFieldError("topic")}>
                <Select.Trigger id="contact-topic" className="contact-topic-trigger" aria-label="What are you reaching out about?" aria-invalid={Boolean(fieldErrors.topic)} aria-describedby={fieldErrors.topic ? "contact-topic-error" : undefined}>
                  <Select.Value placeholder={t("Select a topic")} />
                  <Select.Icon className="contact-topic-chevron"><ChevronDown aria-hidden="true" /></Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="contact-topic-content" position="popper" sideOffset={6}>
                    <Select.Viewport className="contact-topic-viewport">
                      <Select.Item className="contact-topic-item" value="Collaboration"><Select.ItemText>{t("Collaboration")}</Select.ItemText><Select.ItemIndicator className="contact-topic-indicator"><Check aria-hidden="true" /></Select.ItemIndicator></Select.Item>
                      <Select.Item className="contact-topic-item" value="Contract work"><Select.ItemText>{t("Contract work")}</Select.ItemText><Select.ItemIndicator className="contact-topic-indicator"><Check aria-hidden="true" /></Select.ItemIndicator></Select.Item>
                      <Select.Item className="contact-topic-item" value="Open-source contribution"><Select.ItemText>{t("Open-source contribution")}</Select.ItemText><Select.ItemIndicator className="contact-topic-indicator"><Check aria-hidden="true" /></Select.ItemIndicator></Select.Item>
                      <Select.Item className="contact-topic-item" value="A project to learn on"><Select.ItemText>{t("A project to learn on")}</Select.ItemText><Select.ItemIndicator className="contact-topic-indicator"><Check aria-hidden="true" /></Select.ItemIndicator></Select.Item>
                      <Select.Item className="contact-topic-item" value="Something else"><Select.ItemText>{t("Something else")}</Select.ItemText><Select.ItemIndicator className="contact-topic-indicator"><Check aria-hidden="true" /></Select.ItemIndicator></Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
              {fieldErrors.topic && <span id="contact-topic-error" className="contact-field-error">{fieldErrors.topic}</span>}
            </div>
            <label className="contact-form-message" data-aos="fade-up" data-aos-delay="180">{t("Your message")}<textarea name="message" rows={5} placeholder={t("Tell us what you have in mind…")} required aria-invalid={Boolean(fieldErrors.message)} aria-describedby={fieldErrors.message ? "contact-message-error" : undefined} onChange={() => clearFieldError("message")} />{fieldErrors.message && <span id="contact-message-error" className="contact-field-error">{fieldErrors.message}</span>}</label>
          </div>
          <button
            className={`insight-card-contact contact-form-submit${submissionStatus === "sending" ? " is-sending" : ""}${submissionStatus === "success" ? " is-success" : ""}${submissionStatus === "error" ? " is-error" : ""}`}
            type="submit"
            data-aos="fade-up"
            data-aos-delay="220"
            disabled={submissionStatus === "sending"}
            aria-label={submissionStatus === "sending" ? t("Sending message") : undefined}
          >
            <span className="insight-card-contact-icon">
              <Send className="insight-card-contact-arrow" aria-hidden="true" />
              <Check className="insight-card-contact-check" aria-hidden="true" />
              <X className="insight-card-contact-error" aria-hidden="true" />
            </span>
            <span className="insight-card-contact-label" role="status" aria-live="polite">
              {submissionStatus === "sending" ? <LoaderCircle className="contact-submit-loader" aria-hidden="true" /> : submissionStatus === "success" ? t("Message sent successfully") : submissionStatus === "error" ? t("Message Send Error") : t("Send Message")}
            </span>
          </button>
        </form>
      </section>

      <SiteFooter />
    </main>
  );
}
