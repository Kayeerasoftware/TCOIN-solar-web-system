import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { submitLead } from '@/api/endpoints/crm';
import { applyServerErrors } from '@/lib/forms';
import { formatNumber } from '@/lib/money';
import { SizingInputError } from '@/sizing';
import { runEstimate } from '../estimate';
import { leadCaptureSchema, type LeadCaptureForm } from '../schemas';
import type { CalculatorInput } from '../types';
import './CalculatorResults.css';

function amountInWords(low: number, high: number): string {
  const fmt = (n: number) => new Intl.NumberFormat('en-UG').format(Math.round(n));
  return `UGX ${fmt(low)} to UGX ${fmt(high)}`;
}

const issueDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(new Date());

export default function CalculatorResults() {
  const input = (useLocation().state as { input?: CalculatorInput } | null)?.input;
  const result = useMemo(() => {
    if (!input) return null;
    try {
      return runEstimate(input);
    } catch (e) {
      return e instanceof SizingInputError ? e : null;
    }
  }, [input]);

  const [savePrompt, setSavePrompt] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const vw = document.documentElement.clientWidth;
      setScale(Math.min(1, vw / 794));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LeadCaptureForm>({ resolver: zodResolver(leadCaptureSchema) });

  const send = useMutation({
    mutationFn: (v: LeadCaptureForm) =>
      submitLead({
        full_name: v.full_name,
        phone: v.phone || undefined,
        email: v.email || undefined,
        location: input?.district,
        service_interest: 'design',
        source_code: 'web_calculator',
        calculator_input: input,
        calculator_result: result,
        consent_marketing: v.consent,
      }),
    onError: (e) => applyServerErrors(e, setError),
  });

  if (!input) return <Navigate to="/calculator" replace />;
  if (!result || result instanceof SizingInputError) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <p role="alert" className="text-brand-red">
          We could not size that. Check your numbers.
        </p>
        <Link to="/calculator" className="text-brand-green underline">
          Back to the calculator
        </Link>
      </div>
    );
  }

  const quoteItems = [
    {
      no: '01',
      item: 'Solar panels',
      specification: `${result.panels} × 550 W monocrystalline PV modules with mounting accessories`,
      quantity: String(result.panels),
      unit: 'pc',
    },
    {
      no: '02',
      item: 'Hybrid inverter',
      specification: `Approx. ${formatNumber(result.inverterKw, 1)} kW capacity, sized to recommended system load`,
      quantity: '1',
      unit: 'pc',
    },
    {
      no: '03',
      item: 'Battery storage',
      specification: result.batteryKwh
        ? `${formatNumber(result.batteryKwh, 1)} kWh essential backup storage`
        : 'Not included in this estimate',
      quantity: result.batteryKwh ? '1' : '—',
      unit: result.batteryKwh ? 'set' : '',
    },
    {
      no: '04',
      item: 'Installation',
      specification: 'Cabling, protection, mounting, testing and commissioning',
      quantity: '1',
      unit: 'lot',
    },
  ];

  return (
    <main className="qr-stage">
      <div className="qr-actions">
        <button className="qr-glass-btn" type="button" onClick={() => setSavePrompt(true)}>
          <span>Save estimate</span>
          <span className="qr-btn-mark">↓</span>
        </button>
        <button className="qr-print-btn" type="button" onClick={() => window.print()}>
          Print / PDF
        </button>
        <Link to="/calculator" className="qr-print-btn" style={{ display: 'flex', alignItems: 'center' }}>
          ← Change answers
        </Link>
      </div>

      {savePrompt && (
        <div className="qr-save-overlay" onClick={() => setSavePrompt(false)}>
          <div className="qr-save-popup" onClick={(e) => e.stopPropagation()}>
            <button className="qr-save-popup-close" onClick={() => setSavePrompt(false)}>
              ✕
            </button>
            <p>Sign in to save your estimate</p>
            <Link
              to="/login"
              className="qr-submit-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      <article
        className="qr-doc"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          marginLeft: scale < 1 ? `${(document.documentElement.clientWidth - 794 * scale) / 2}px` : 'auto',
          marginRight: scale < 1 ? 0 : 'auto',
          marginBottom: scale < 1 ? `calc((${scale} - 1) * 100%)` : undefined,
        }}
      >
        {/* ── Masthead ── */}
        <header className="qr-masthead">
          <div className="qr-logo-lockup">
            <img src="/brand/TCOIN LOGO OFFICIAL.svg" alt="TCOIN We Plan and Do" className="qr-logo-img" />
            <span className="qr-tagline">CENTER OF INNOVATIONS</span>
          </div>
          <div className="qr-masthead-center">
            <strong>TCOIN Solar</strong>
            <span>Uganda</span>
          </div>
          <div className="qr-company-details">
            <strong>Located at Nabulagala — near Kasubi Royal Tombs</strong>
            <span>P.O. Box 500273, Kampala, Uganda</span>
            <span>Tel: 0779 116 709 · 0705 998 786 · 0705 111 123</span>
            <span>info.tcoinug@gmail.com · www.tcoinug.com</span>
          </div>
        </header>

        <div className="qr-brand-stripe">
          <span />
        </div>

        <section className="qr-services">
          <p>Solar design, inspection, installation, maintenance and consultancy</p>
          <p>Electrical installations, system design, inspection and maintenance</p>
          <p>Supply of electrical, electronic and solar installation materials</p>
        </section>

        {/* ── Party grid ── */}
        <section className="qr-party-grid">
          <div className="qr-client-block">
            <p className="qr-block-label">Prepared for</p>
            <strong>{input.district ? `${input.district} — Solar Client` : 'Solar Client'}</strong>
            <span>Uganda</span>
            <span>Site details to be confirmed after survey</span>
          </div>
          <div className="qr-invoice-block">
            <h1>Solar System Quotation</h1>
            <dl>
              <div>
                <dt>Quote no.</dt>
                <dd>EST–{issueDate.replace(/ /g, '')}</dd>
              </div>
              <div>
                <dt>Issue date</dt>
                <dd>{issueDate}</dd>
              </div>
              <div>
                <dt>Validity</dt>
                <dd>30 days</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── Summary line ── */}
        <section className="qr-summary-line">
          <div>
            <p className="qr-block-label">Recommended capacity</p>
            <strong>{formatNumber(result.arrayKwp, 1)} kWp</strong>
          </div>
          <p>
            A solar system sized for efficient daytime generation
            {result.batteryKwh ? ` with ${formatNumber(result.batteryKwh, 1)} kWh backup storage` : ''}.{' '}
            {result.disclaimer}
          </p>
        </section>

        {/* ── Items table ── */}
        <section className="qr-table" aria-label="Quotation items">
          <div className="qr-row qr-row-head">
            <span>No.</span>
            <span>Particulars</span>
            <span>Size / specification</span>
            <span>Qty</span>
            <span>Unit</span>
          </div>
          {quoteItems.map((item) => (
            <div className="qr-row" key={item.no}>
              <span>{item.no}</span>
              <strong>{item.item}</strong>
              <span>{item.specification}</span>
              <span>{item.quantity}</span>
              <span>{item.unit}</span>
            </div>
          ))}
        </section>

        {/* ── Totals ── */}
        <section className="qr-totals">
          <div className="qr-performance">
            <p className="qr-block-label">Projected performance</p>
            <div>
              <span>Estimated annual savings</span>
              <strong>UGX {formatNumber(result.annualSavings)}</strong>
            </div>
            {result.paybackYearsLow && (
              <div>
                <span>Estimated payback period</span>
                <strong>
                  {result.paybackYearsLow}–{result.paybackYearsHigh} years
                </strong>
              </div>
            )}
          </div>
          <div className="qr-grand-total">
            <div className="qr-invest-heading">
              <span>Estimated investment</span>
              <small>Equipment + installation</small>
            </div>
            <div className="qr-invest-range">
              <div>
                <span>From</span>
                <strong>
                  <small>UGX</small> {formatNumber(result.priceLow)}
                </strong>
              </div>
              <i />
              <div>
                <span>Up to</span>
                <strong>
                  <small>UGX</small> {formatNumber(result.priceHigh)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* ── Commercial notes ── */}
        <section className="qr-commercial-notes">
          <h2>Commercial notes</h2>
          <div className="qr-notes-grid">
            <p>
              <strong>Price basis</strong>Final pricing is subject to a site survey, selected equipment brands
              and cable runs.
            </p>
            <p>
              <strong>Included</strong>Standard mounting, system protection, installation, testing and
              commissioning.
            </p>
            <p>
              <strong>Not included</strong>Structural works, utility fees or upgrades outside the stated
              system scope.
            </p>
            <p>
              <strong>Warranty</strong>Manufacturer warranties apply. Installation workmanship terms are
              confirmed on order.
            </p>
          </div>
        </section>

        {/* ── Amount in words ── */}
        <section className="qr-amount-words">
          <span>Amount in words (indicative range)</span>
          <p>{amountInWords(result.priceLow, result.priceHigh)} Uganda shillings only.</p>
        </section>

        {/* ── Signatures ── */}
        <section className="qr-signatures">
          <div>
            <div className="qr-sig-line">
              <span>Client's signature</span>
              <i />
            </div>
          </div>
          <div>
            <div className="qr-sig-line">
              <span>Prepared by</span>
              <i />
            </div>
            <strong>For and on behalf of TCOIN</strong>
          </div>
        </section>

        <footer className="qr-footer">
          <strong>We Plan and Do . . . .</strong>
          <span>E&amp;OE · All figures are estimates pending site assessment.</span>
        </footer>
      </article>

      {/* ── Lead capture — outside the printable document ── */}
      <div className="qr-lead-outer">
        {send.isSuccess ? (
          <div className="qr-lead-success">
            <p className="qr-block-label">Request received</p>
            <strong>Thank you — we will call you soon.</strong>
            <span>
              Your reference is <strong>{send.data.lead_no}</strong>. An engineer will confirm the design
              after a site survey.
            </span>
          </div>
        ) : (
          <>
            <button className="qr-quote-cta" type="button" onClick={() => setFormOpen((o) => !o)}>
              {formOpen ? '✕ Close' : 'Send me the detailed quote'}
            </button>

            {formOpen && (
              <div className="qr-lead-form">
                <h2>Get your detailed quote</h2>
                <form
                  onSubmit={handleSubmit((v) => send.mutate(v))}
                  noValidate
                  aria-label="Get my detailed quote"
                >
                  {errors.root && (
                    <p role="alert" className="qr-form-error">
                      {errors.root.message}
                    </p>
                  )}
                  <div className="qr-form-grid">
                    <div className="qr-form-field">
                      <label htmlFor="full_name">Your name *</label>
                      <input
                        id="full_name"
                        className={errors.full_name ? 'qr-input-invalid' : ''}
                        {...register('full_name')}
                      />
                      {errors.full_name && <span className="qr-field-error">{errors.full_name.message}</span>}
                    </div>
                    <div className="qr-form-field">
                      <label htmlFor="phone">Phone</label>
                      <input
                        id="phone"
                        type="tel"
                        className={errors.phone ? 'qr-input-invalid' : ''}
                        {...register('phone')}
                      />
                      {errors.phone && <span className="qr-field-error">{errors.phone.message}</span>}
                    </div>
                    <div className="qr-form-field">
                      <label htmlFor="email">Email (optional)</label>
                      <input id="email" type="email" {...register('email')} />
                    </div>
                  </div>
                  <label className="qr-consent">
                    <input type="checkbox" {...register('consent')} />I agree that TCOIN may contact me about
                    this quote
                  </label>
                  <div className="qr-form-bottom">
                    <button type="submit" className="qr-submit-btn" disabled={send.isPending}>
                      {send.isPending ? 'Sending…' : 'Send me the detailed quote'}
                    </button>
                    <span className="qr-form-or">OR</span>
                    <Link
                      to="/login"
                      className="qr-submit-btn"
                      style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                    >
                      Sign in to serve yourself →
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
