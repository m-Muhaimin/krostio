import { requireRole } from '@/lib/auth-guard'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const LOAN_TYPES = [
  { value: 'auto', label: 'Auto' },
  { value: 'personal', label: 'Personal' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'business', label: 'Business' },
  { value: 'cash_advance', label: 'Cash advance' },
] as const

function sanitizeSlug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function updateListing(formData: FormData) {
  'use server'
  const { userId } = await requireRole(['lender'])
  const service = createServiceSupabaseClient()

  const company_name = String(formData.get('company_name') ?? '').trim()
  const slugRaw = String(formData.get('slug') ?? '').trim()
  const slug = sanitizeSlug(slugRaw || company_name)
  const logo_url = (String(formData.get('logo_url') ?? '').trim() || null)
  const tagline = (String(formData.get('tagline') ?? '').trim() || null)
  const description = (String(formData.get('description') ?? '').trim() || null)
  const website_url = (String(formData.get('website_url') ?? '').trim() || null)
  const application_url = String(formData.get('application_url') ?? '').trim()

  const loan_types = LOAN_TYPES
    .map((t) => t.value)
    .filter((v) => formData.get(`loan_type_${v}`) === 'on')

  const toIntOrNull = (k: string) => {
    const raw = String(formData.get(k) ?? '').trim()
    if (!raw) return null
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  }
  const toNumericOrNull = (k: string) => {
    const raw = String(formData.get(k) ?? '').trim()
    if (!raw) return null
    const n = parseFloat(raw)
    return Number.isFinite(n) ? n : null
  }

  const min_consistency_score = toIntOrNull('min_consistency_score')
  const min_fico = toIntOrNull('min_fico')
  const statesRaw = String(formData.get('states_served') ?? '').trim()
  const states_served = statesRaw
    ? statesRaw
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => /^[A-Z]{2}$/.test(s))
    : []
  const min_loan_amount = toIntOrNull('min_loan_amount')
  const max_loan_amount = toIntOrNull('max_loan_amount')
  const typical_apr_min = toNumericOrNull('typical_apr_min')
  const typical_apr_max = toNumericOrNull('typical_apr_max')

  // Validation — on failure, redirect with error in query string (server actions must return void)
  if (!company_name) redirect('/dashboard/lender/listing?error=company')
  if (!application_url || !/^https?:\/\//.test(application_url)) {
    redirect('/dashboard/lender/listing?error=app_url')
  }
  if (loan_types.length === 0) redirect('/dashboard/lender/listing?error=loan_types')
  if (!slug) redirect('/dashboard/lender/listing?error=slug')

  await service
    .from('lender_profiles')
    .upsert(
      {
        id: userId,
        company_name,
        slug,
        logo_url,
        tagline,
        description,
        website_url,
        application_url,
        loan_types,
        min_consistency_score,
        min_fico,
        states_served,
        min_loan_amount,
        max_loan_amount,
        typical_apr_min,
        typical_apr_max,
      },
      { onConflict: 'id' },
    )

  revalidatePath('/dashboard/lender/listing')
  revalidatePath('/lenders')
  redirect('/dashboard/lender/listing?saved=1')
}

export default async function LenderListingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>
}) {
  const { userId } = await requireRole(['lender'])
  const sp = await searchParams
  const service = createServiceSupabaseClient()

  const { data: listing } = await service
    .from('lender_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  const { data: profile } = await service
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()

  const v = (k: string, fallback = '') => {
    const val = (listing as Record<string, unknown> | null)?.[k]
    if (val == null) return fallback
    return String(val)
  }

  const loanTypes: string[] = (listing?.loan_types as string[]) ?? []
  const statesServed: string[] = (listing?.states_served as string[]) ?? []
  const fullName = (profile as { full_name?: string } | null)?.full_name ?? ''

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <p className="text-mono-label text-slate">Directory listing</p>
        <h1 className="mt-3 font-display text-[40px] leading-none tracking-tight text-ink-black">
          {listing ? 'Edit your listing' : 'Create your listing'}
        </h1>
        <p className="mt-3 text-body text-slate">
          Your public profile in the Krost lender directory. Workers see this when browsing for
          financing options.
        </p>
        {sp.saved === '1' && (
          <p className="mt-4 rounded-md border border-hairline bg-soft-stone px-4 py-3 text-sm text-ink-black">
            Saved. View your listing at <a className="link-editorial" href={`/lenders/${v('slug')}`}>/lenders/{v('slug')}</a>.
          </p>
        )}
      </div>

      <form action={updateListing} className="space-y-8">
        <fieldset className="space-y-6">
          <legend className="text-mono-label text-slate">Basics</legend>

          <Field label="Company name" name="company_name" defaultValue={v('company_name', fullName)} required />
          <Field label="URL slug (lowercase, hyphens)" name="slug" defaultValue={v('slug')} placeholder="my-lender" required />
          <Field label="Logo URL" name="logo_url" defaultValue={v('logo_url')} placeholder="https://logo.clearbit.com/yourdomain.com" />
          <Field label="Tagline (short pitch)" name="tagline" defaultValue={v('tagline')} maxLength={120} />

          <label className="block">
            <span className="text-mono-label text-slate">Description (markdown supported)</span>
            <textarea
              name="description"
              defaultValue={v('description')}
              rows={8}
              className="mt-2 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-ink-black"
            />
          </label>

          <Field label="Website URL" name="website_url" defaultValue={v('website_url')} placeholder="https://example.com" />
          <Field
            label="Application URL (where Krost sends workers)"
            name="application_url"
            defaultValue={v('application_url')}
            placeholder="https://example.com/apply"
            required
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-mono-label text-slate">Loan types</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {LOAN_TYPES.map((t) => (
              <label key={t.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`loan_type_${t.value}`}
                  defaultChecked={loanTypes.includes(t.value)}
                  className="h-4 w-4 accent-[var(--color-deep-green)]"
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="text-mono-label text-slate">Requirements & terms</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Min Krost score (0–100)" name="min_consistency_score" type="number" defaultValue={v('min_consistency_score')} />
            <Field label="Min FICO" name="min_fico" type="number" defaultValue={v('min_fico')} />
            <Field label="Min loan amount ($)" name="min_loan_amount" type="number" defaultValue={v('min_loan_amount')} />
            <Field label="Max loan amount ($)" name="max_loan_amount" type="number" defaultValue={v('max_loan_amount')} />
            <Field label="Typical APR min (%)" name="typical_apr_min" type="number" step="0.01" defaultValue={v('typical_apr_min')} />
            <Field label="Typical APR max (%)" name="typical_apr_max" type="number" step="0.01" defaultValue={v('typical_apr_max')} />
          </div>
          <Field
            label="States served (2-letter codes, comma separated. Leave blank for all 50.)"
            name="states_served"
            defaultValue={statesServed.join(', ')}
            placeholder="CA, TX, NY"
          />
        </fieldset>

        <button type="submit" className="btn-primary">
          {listing ? 'Save changes' : 'Create listing'}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
  required,
  maxLength,
  step,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  placeholder?: string
  required?: boolean
  maxLength?: number
  step?: string
}) {
  return (
    <label className="block">
      <span className="text-mono-label text-slate">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        step={step}
        className="mt-2 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-ink-black"
      />
    </label>
  )
}
