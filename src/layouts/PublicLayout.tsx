import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, Heart, Menu, ShieldCheck, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'

const navClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' nav-link-active' : ''}`

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="public-shell">
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Wandora home"><span className="brand-mark"><Compass size={20} strokeWidth={2.4} /></span><span>wandora<span className="brand-period">.</span></span></Link>
        <button className="icon-button mobile-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu size={21} /></button>
        <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label="Main navigation">
          <NavLink className={navClass} to="/stays" onClick={() => setMenuOpen(false)}>Explore stays</NavLink>
          <Link className="nav-link" to="/#how-it-works" onClick={() => setMenuOpen(false)}>How it works</Link>
          <Link className="nav-link host-link" to="/host" onClick={() => setMenuOpen(false)}>Host with us</Link>
          <span className="nav-divider" />
          <NavLink className={navClass} to="/login" onClick={() => setMenuOpen(false)}>Log in</NavLink>
          <Link className="button button-dark button-small" to="/register" onClick={() => setMenuOpen(false)}>Join Wandora <ArrowRight size={15} /></Link>
        </nav>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="site-footer">
      <Link to="/" className="brand footer-brand"><span className="brand-mark"><Compass size={18} strokeWidth={2.4} /></span><span>wandora<span className="brand-period">.</span></span></Link>
      <p>Go somewhere. Feel at home.</p>
      <span className="footer-copy">© 2025 Wandora · Made for the way you travel</span>
    </footer>
  </div>
}

export function HomePage() {
  const navigate = useNavigate()
  const [searchError, setSearchError] = useState('')
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const city = String(form.get('city') || '').trim()
    const startDate = String(form.get('startDate') || '')
    const endDate = String(form.get('endDate') || '')
    const roomCount = Math.max(1, Number(form.get('roomCount') || 1))

    if (Boolean(startDate) !== Boolean(endDate)) {
      setSearchError('Enter both check-in and check-out dates, or leave both blank.')
      return
    }
    if (startDate && endDate && endDate <= startDate) {
      setSearchError('Check-out must be after check-in.')
      return
    }
    if (startDate && startDate < new Date().toISOString().slice(0, 10)) {
      setSearchError('Check-in cannot be in the past.')
      return
    }

    setSearchError('')
    const query = new URLSearchParams()
    if (city) query.set('city', city)
    if (startDate) query.set('startDate', startDate)
    if (endDate) query.set('endDate', endDate)
    query.set('roomCount', String(roomCount))
    navigate(`/stays?${query.toString()}`)
  }
  return <>
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
        <h1>Find your<br /><span>somewhere.</span></h1>
        <p className="hero-description">Stays that feel like you. People who make the journey. A little more wonder in every getaway.</p>
        <div className="hero-actions"><Link to="/stays" className="button button-dark">Explore places <ArrowRight size={17} /></Link><Link to="/register" className="text-link">Plan a trip together <Heart size={16} /></Link></div>
        <div className="hero-proof"><span className="proof-compass"><Compass size={18}/></span><span className="proof-caption">Thoughtful stays, real hosts, and trips planned around you.</span></div>
      </div>
      <div className="hero-art" role="img" aria-label="Sunlit Mediterranean coastal village">
        <div className="hero-image"><div className="image-overlay" /><div className="image-location"><span className="location-dot" /> AMALFI COAST, ITALY</div><div className="floating-card"><span className="floating-icon"><Sparkles size={17} /></span><span><strong>A place to slow down</strong><small>Find your next Wandora stay</small></span></div></div>
        <div className="art-stamp"><span>GO</span><span>FAR</span><span>FEEL</span><span>MORE</span><Sparkles className="stamp-sparkle" size={17} /></div>
        <span className="art-caption">somewhere between<br />here and there <span>↗</span></span>
      </div>
      <div className="hero-decor decor-one" /><div className="hero-decor decor-two" />
    </section>
    <section className="search-strip" aria-label="Find a stay">
      <div className="search-heading"><span className="search-icon"><Compass size={18} /></span><span><b>Start with a feeling</b><small>Where would you like to wake up?</small></span></div>
      <div className="search-form-wrap">
        <form className="search-form" onSubmit={submitSearch} noValidate>
          <label><span>DESTINATION</span><input name="city" aria-label="Destination" placeholder="Where would you like to go?" /></label>
          <label><span>CHECK IN</span><input name="startDate" aria-label="Check in date" type="date" /></label>
          <label><span>CHECK OUT</span><input name="endDate" aria-label="Check out date" type="date" /></label>
          <label className="search-room-count"><span>ROOMS</span><input name="roomCount" aria-label="Rooms" type="number" min="1" max="100" defaultValue="1" /></label>
          <button className="button button-green search-button" type="submit"><Compass size={18} /> Find a stay</button>
        </form>
        {searchError && <p className="search-form-error" role="alert">{searchError}</p>}
      </div>
    </section>
    <section className="intro-section" id="how-it-works">
      <div className="section-kicker"><span className="line" /> A DIFFERENT KIND OF GETAWAY <span className="line" /></div>
      <h2>Travel is better when<br /><em>it feels like yours.</em></h2>
      <p>Not just a place to sleep. A place that changes the pace, opens a door, or brings your people a little closer.</p>
      <div className="value-grid">
        <article className="value-card"><div className="value-icon green"><Compass size={22} /></div><span className="value-number">01 / FIND</span><h3>Places with a point of view</h3><p>From hidden city apartments to slow mornings on the coast, discover stays with a little soul.</p><Link to="/stays" className="value-link">Find your place <ArrowRight size={15} /></Link></article>
        <article className="value-card"><div className="value-icon peach"><Heart size={22} /></div><span className="value-number">02 / SHARE</span><h3>Bring your people along</h3><p>Build a trip together, swap ideas and make a plan everyone actually wants to take.</p><Link to="/register" className="value-link">Start planning <ArrowRight size={15} /></Link></article>
        <article className="value-card"><div className="value-icon lavender"><ShieldCheck size={22} /></div><span className="value-number">03 / STAY</span><h3>Feel good about where you land</h3><p>Thoughtful host verification and secure bookings keep the good part of travel in focus.</p><Link to="/register" className="value-link">Travel with ease <ArrowRight size={15} /></Link></article>
      </div>
    </section>
    <section className="host-banner"><div className="host-image" /><div className="host-banner-copy"><span className="eyebrow"><span className="eyebrow-dot" /> FOR THE PEOPLE WHO MAKE A PLACE</span><h2>Your space has<br /><em>a story. Share it.</em></h2><p>Meet travelers who are looking for more than a bed. Host with care, and give them a stay worth remembering.</p><Link to="/host" className="button button-dark">Become a host <ArrowRight size={17} /></Link></div><span className="host-scribble">make room<br />for wonder ↗</span></section>
    <section className="closing-cta"><span className="eyebrow"><span className="eyebrow-dot" /> THE WORLD IS WAITING</span><h2>Go a little<br /><em>further.</em></h2><Link to="/stays" className="button button-dark">Find your somewhere <ArrowRight size={17} /></Link></section>
  </>
}
