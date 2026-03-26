import { useNavigate } from 'react-router-dom'

const heroImage =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80'

function RegisterPage() {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <img src={heroImage} alt="Mountain landscape" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/60" />

      <div className="relative z-10 px-6 pt-10">
        <p className="text-4xl leading-none text-white">ventür</p>
        <p className="mt-1 text-xs text-white/70">The adventure continues</p>
      </div>

      <section className="absolute inset-x-0 bottom-0 z-20 rounded-t-[56px] bg-white px-6 pb-8 pt-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold leading-none text-zinc-900">Welcome.</h1>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-3 text-sm text-zinc-700 sm:max-w-md">
            <div>
              <label className="mb-1.5 block">Name</label>
              <input type="text" className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 outline-none" />
            </div>

            <div>
              <label className="mb-1.5 block">Email</label>
              <input type="email" className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 outline-none" />
            </div>

            <div>
              <label className="mb-1.5 block">Password</label>
              <input type="password" className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 outline-none" />
            </div>

            <div>
              <label className="mb-1.5 block">Confirm Password</label>
              <input type="password" className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 outline-none" />
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-zinc-500">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-zinc-300" />
              I agree to the Terms and Conditions
            </label>

            <button type="submit" className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white">
              Sign up
            </button>
          </form>

          <p className="mt-4 text-sm text-zinc-500">
            Already a member?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-zinc-900"
            >
              Sign in
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}

export default RegisterPage
