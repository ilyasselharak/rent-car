"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function ContactPage() {
  const { t } = useTranslations();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t("Message Sent!")}</h1>
        <p className="text-muted-foreground">{t("Thank you for reaching out. We will get back to you shortly.")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t("Contact Us")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, title: t("Email"), content: "support@rentcar.com" },
              { icon: Phone, title: t("Phone"), content: "+1 (555) 123-4567" },
              { icon: MapPin, title: t("Address"), content: "123 Enterprise Ave, New York, NY 10001" },
              { icon: Clock, title: t("Hours"), content: "Mon-Fri: 9AM - 6PM EST" },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("First Name")}</label>
                    <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("Last Name")}</label>
                    <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Email")}</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Subject")}</label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Message")}</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Tell us more about your inquiry..." required />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Sending...")}</> : <><Send className="mr-2 h-4 w-4" /> {t("Send Message")}</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
