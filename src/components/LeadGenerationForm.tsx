import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  ONE_CLICK_EXCLUDE_KEYWORDS,
  ONE_CLICK_INCLUDE_KEYWORDS,
  ONE_CLICK_INDUSTRIES,
  WEBHOOK_URL,
} from '../leadFormConstants';

function errorMessageFromResult(result: unknown, fallback: string): string {
  if (result && typeof result === 'object') {
    const r = result as Record<string, unknown>;
    const msg = r.message ?? r.error ?? r.detail;
    if (typeof msg === 'string' && msg.trim()) return msg;
    if (Array.isArray(msg) && typeof msg[0] === 'string') return msg[0];
  }
  return fallback;
}

function networkErrorMessageForWebhook(url: string): string {
  if (url.includes('/webhook-test/')) {
    return 'Webhook test URL is not armed. In n8n, click "Execute workflow" and retry, or switch to the production /webhook URL.';
  }
  return 'Cannot reach webhook right now. Verify the n8n workflow is active and the webhook path is correct.';
}

function buildOneClickPayload(): Record<string, string> {
  return {
    industry: ONE_CLICK_INDUSTRIES.join(','),
    state: 'United States',
    companySize: '1-10,11-20,21-50',
    contactTarget: 'Owner,CEO,Partner',
    leadCount: '100',
    campaignName: `Apollo One-Click ${new Date().toISOString().slice(0, 10)}`,
    revenue: '$1M-$10M',
    keywords: ONE_CLICK_INCLUDE_KEYWORDS.join(','),
    excludeKeywords: ONE_CLICK_EXCLUDE_KEYWORDS.join(','),
    department: 'C-Suite',
  };
}

type PayloadKey = keyof ReturnType<typeof buildOneClickPayload>;

const FORM_FIELDS: {
  label: string;
  key: PayloadKey;
  multiline?: boolean;
}[] = [
  { label: 'Job Titles', key: 'contactTarget' },
  { label: 'Department', key: 'department' },
  { label: 'Employees', key: 'companySize' },
  { label: 'Revenue', key: 'revenue' },
  { label: 'Location', key: 'state' },
  { label: 'Industries', key: 'industry', multiline: true },
  { label: 'Include Keywords', key: 'keywords', multiline: true },
  { label: 'Exclude Keywords', key: 'excludeKeywords', multiline: true },
  { label: 'Lead count', key: 'leadCount' },
  { label: 'Campaign name', key: 'campaignName' },
];

const LeadGenerationForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => buildOneClickPayload());
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
    detail?: string;
  } | null>(null);

  const updateField = (key: PayloadKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const sendToWebhook = async (formPayload: Record<string, string>) => {
    setToast(null);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formPayload),
        mode: 'cors',
        signal: controller.signal,
      });

      let result: unknown = null;
      try {
        result = await response.json();
      } catch {
        /* non-JSON body */
      }

      if (!response.ok) {
        const fallback = `Request failed (${response.status}).`;
        setToast({
          type: 'error',
          message: errorMessageFromResult(result, fallback),
        });
        return;
      }

      const data = result as Record<string, unknown> | null;
      const leadsRaw = data?.leads_sent_to_clay;
      const leadsCount =
        typeof leadsRaw === 'number'
          ? leadsRaw
          : typeof leadsRaw === 'string'
            ? leadsRaw
            : String(leadsRaw ?? '');
      const campaignFromApi = data?.campaign_name ?? data?.campaignName;
      const displayCampaign =
        typeof campaignFromApi === 'string' && campaignFromApi.trim()
          ? campaignFromApi.trim()
          : formPayload.campaignName;

      const summary =
        typeof result === 'object' && result !== null
          ? JSON.stringify(result, null, 2)
          : '';

      setToast({
        type: 'success',
        message: `✅ Lead generation started! ${leadsCount} leads are being processed through Clay for personalization and will be automatically added to your Instantly campaign '${displayCampaign}'. This typically takes 5-15 minutes.`,
        detail: summary || undefined,
      });
    } catch (error) {
      const err =
        error && typeof error === 'object' ? (error as { name?: string }) : null;
      const isAbort = err?.name === 'AbortError';
      if (isAbort) {
        setToast(null);
        window.alert(
          'Your leads will be in Instantly in 3–8 mins.'
        );
      } else {
        setToast({
          type: 'error',
          message: networkErrorMessageForWebhook(WEBHOOK_URL),
        });
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleOneClickStart = async () => {
    await sendToWebhook(form);
  };

  return (
    <div className="lead-form-card">
      <h2 className="lead-form-title">Apollo preset to n8n</h2>
      <p className="lead-form-subtitle">
        Edit any field below, then send this filter package to your webhook.
      </p>
      <div className="lead-form">
        {FORM_FIELDS.map(({ label, key, multiline }) => (
          <div className="form-row" key={key}>
            <label className="form-label" htmlFor={`field-${key}`}>
              {label}
            </label>
            {multiline ? (
              <textarea
                id={`field-${key}`}
                className="form-control"
                rows={4}
                value={form[key]}
                disabled={loading}
                onChange={(e) => updateField(key, e.target.value)}
              />
            ) : (
              <input
                id={`field-${key}`}
                type="text"
                className="form-control"
                value={form[key]}
                disabled={loading}
                onChange={(e) => updateField(key, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="form-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={loading}
            onClick={handleOneClickStart}
          >
            {loading ? (
              <>
                <Loader2 className="spinner-icon" size={20} aria-hidden />
                Sending…
              </>
            ) : (
              'Run Apollo preset'
            )}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`toast status-message status-${toast.type}`}
          role="status"
        >
          <div className="toast-main">{toast.message}</div>
          {toast.detail && toast.type === 'success' && (
            <pre className="toast-detail">{toast.detail}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadGenerationForm;
