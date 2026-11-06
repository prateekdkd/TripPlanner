import React,  { useMemo, useState } from "react";
import {
  Plane, House, CalendarDays, UserRound, MapPin, Users, Wallet,
  Utensils, Camera, Sparkles, Plus, Eye, Pencil, Trash2, Menu,
  X, Compass, ChevronDown, Clock3, ArrowRight, CheckCircle2
} from "lucide-react";

const initialTrips = [
  { id: 1, destination: "Goa", origin: "Bhopal", startDate: "12 Mar 2027", duration: 4, travelers: 2, stay: "Budget", cost: 18450, status: "Planned" },
  { id: 2, destination: "Manali", origin: "Bhopal", startDate: "05 Apr 2027", duration: 5, travelers: 3, stay: "Standard", cost: 26800, status: "Planned" },
  { id: 3, destination: "Jaipur", origin: "Bhopal", startDate: "20 May 2027", duration: 4, travelers: 2, stay: "Budget", cost: 16200, status: "Planned" },
  { id: 4, destination: "Kerala", origin: "Bhopal", startDate: "10 Jun 2027", duration: 5, travelers: 2, stay: "Standard", cost: 22750, status: "Planned" },
];

const money = (n) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(n);

function estimateDemo({ duration, travelers, stay }) {
  // Temporary demo estimate only. Replace with the trained ML/DL API later.
  const basePerPersonDay = stay === "Luxury" ? 5200 : stay === "Standard" ? 3200 : 2100;
  const total = Math.max(1, Number(duration) || 1) * Math.max(1, Number(travelers) || 1) * basePerPersonDay;
  return {
    total: Math.round(total),
    travel: Math.round(total * 0.34),
    accommodation: Math.round(total * 0.30),
    food: Math.round(total * 0.16),
    activities: total - Math.round(total * 0.34) - Math.round(total * 0.30) - Math.round(total * 0.16),
  };
}

function Sidebar({ active, onNavigate, mobileOpen, onClose }) {
  const links = [
    { label: "Home", icon: House },
    { label: "Predict Trip Cost", icon: Wallet },
    { label: "My Trips", icon: CalendarDays },
    { label: "Profile", icon: UserRound },
  ];
  return (
    <>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Plane size={25} /></div>
          <div><div className="brand-name">TripPlanner</div><div className="brand-tag">Plan Smarter. Travel Better.</div></div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu"><X size={19}/></button>
        </div>
        <nav className="nav-list">
          {links.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${active === label ? "active" : ""}`}
              onClick={() => { onNavigate(label); onClose(); }}>
              <Icon size={18} strokeWidth={2.1}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mountain-art"><span>✦</span><span>⌁</span><span>♧</span></div>
          <p>“Better planning<br/>leads to better travels.”</p>
        </div>
      </aside>
    </>
  );
}

function CostRow({ title, amount, percent, icon: Icon, tone }) {
  return (
    <div className="cost-row">
      <div className={`cost-icon ${tone}`}><Icon size={19}/></div>
      <div className="cost-detail">
        <div className="cost-line"><span>{title}</span><strong>{money(amount)}</strong><small>{percent}%</small></div>
        <div className="progress"><span className={tone} style={{ width: `${percent}%` }}/></div>
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [origin, setOrigin] = useState("Bhopal");
  const [destination, setDestination] = useState("Goa");
  const [duration, setDuration] = useState("4");
  const [travelers, setTravelers] = useState("2");
  const [stay, setStay] = useState("Budget");
  const [trips, setTrips] = useState(initialTrips);
  const [result, setResult] = useState(() => estimateDemo({ duration: 4, travelers: 2, stay: "Budget" }));
  const [notice, setNotice] = useState("Demo estimate — not a trained model prediction.");
  const [editingId, setEditingId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [profileName, setProfileName] = useState("Rahul Sharma");
  const [season, setSeason] = useState("Regular");
  const [transport, setTransport] = useState("Train");
  const [distance, setDistance] = useState("1200");
  const breakdown = useMemo(() => {
    const total = result.total || 1;
    return [
      { title: "Travel (Transport)", amount: result.travel, percent: Math.round(result.travel / total * 100), icon: Plane, tone: "blue" },
      { title: "Accommodation (Stay)", amount: result.accommodation, percent: Math.round(result.accommodation / total * 100), icon: House, tone: "green" },
      { title: "Food", amount: result.food, percent: Math.round(result.food / total * 100), icon: Utensils, tone: "orange" },
      { title: "Activities & Others", amount: result.activities, percent: Math.round(result.activities / total * 100), icon: Camera, tone: "purple" },
    ];
  }, [result]);

 const predict = async (event) => {
  event.preventDefault();

  if (!origin.trim() || !destination.trim()) {
    setNotice("Please enter origin and destination.");
    return;
  }

  if (Number(duration) < 1 || Number(travelers) < 1 || Number(distance) <= 0) {
    setNotice("Please enter valid trip details.");
    return;
  }

  setNotice("Predicting trip cost...");
  
  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        origin_city: origin,
        destination_city: destination,
        trip_days: Number(duration),
        traveler_count: Number(travelers),
        stay_preference: stay,
        season: season,
        transport_mode: transport,
        approx_route_distance_km: Number(distance)
      })
    });

    if (!response.ok) {
      throw new Error("Prediction request failed");
    }

    const data = await response.json();

   const total = data.predicted_trip_cost;

setResult({
  total: total,
  travel: total * 0.30,
  accommodation: total * 0.40,
  food: total * 0.20,
  activities: total * 0.10
});

    setNotice("ML model prediction successful!");
    setActive("Predict Trip Cost");

  } catch (error) {
    console.error(error);
    setNotice("Unable to connect to prediction API. Please check backend.");
  }
}

  const saveTrip = () => {
    const trip = {
      id: editingId || Date.now(),
      origin: origin.trim(),
      destination: destination.trim(),
      startDate: "Date not set",
      duration: Number(duration),
      travelers: Number(travelers),
      stay,
      cost: result.total,
      status: "Planned",
    };
    setTrips(prev => editingId
      ? prev.map(item => item.id === editingId ? trip : item)
      : [trip, ...prev]);
    setEditingId(null);
    setNotice(editingId ? "Trip updated in this demo." : "Trip saved in this session.");
    setActive("My Trips");
  };

  const editTrip = (trip) => {
    setOrigin(trip.origin);
    setDestination(trip.destination);
    setDuration(String(trip.duration));
    setTravelers(String(trip.travelers));
    setStay(trip.stay);
    setResult(estimateDemo(trip));
    setEditingId(trip.id);
    setActive("Predict Trip Cost");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTrip = (id) => {
    setTrips(prev => prev.filter(trip => trip.id !== id));
    setNotice("Trip removed from this demo session.");
  };

  const navigate = (label) => {
    setActive(label);
    if (label === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={navigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-content">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu/></button>
          <div className="breadcrumb"><Compass size={16}/><span>{active}</span></div>
          <button className="profile-button" onClick={() => setActive("Profile")}>
            <span className="avatar"><UserRound size={17}/></span><span>{profileName}</span><ChevronDown size={15}/>
          </button>
        </header>

        {active === "Profile" ? (
          <section className="page-section profile-page">
            <div className="page-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile</h1><p>Update the name shown in your dashboard.</p></div></div>
            <div className="panel profile-panel">
              <label htmlFor="profileName">Display name</label>
              <input id="profileName" value={profileName} onChange={e => setProfileName(e.target.value)} />
              <p className="muted small">This is frontend-only demo state. Login and account storage are not connected.</p>
            </div>
          </section>
        ) : (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="hero-pill"><Sparkles size={14}/> YOUR NEXT ADVENTURE STARTS HERE</span>
                <h1>{active === "My Trips" ? "Your trips, all in one place" : "Plan Your Next Trip"}</h1>
                <p>{active === "My Trips" ? "View and manage the journeys you have planned." : "Enter your travel details and get an estimated cost for your next adventure."}</p>
              </div>
              <div className="hero-illustration" aria-hidden="true">
                <div className="sun"></div><div className="mountain mountain-back"></div><div className="mountain mountain-front"></div>
                <div className="route-line"></div><div className="route-pin"><MapPin size={20}/></div>
                <div className="hero-stamp">Explore<br/>more <ArrowRight size={17}/></div>
              </div>
            </section>

            {active !== "My Trips" && (
              <section className="page-section">
                <div className="section-heading">
                  <div><p className="eyebrow">TRIP PLANNER</p><h2>Predict Trip Cost</h2><p className="muted">Tell us a little about your trip to get a budget estimate.</p></div>
                  <span className="status-chip"><span className="status-dot"/> AI mode</span>
                </div>
                <div className="planner-grid">
                  <form className="panel form-panel" onSubmit={predict}>
                    <div className="panel-title"><span className="title-icon blue"><Wallet size={19}/></span><div><h3>Trip details</h3><p>Where would you like to go?</p></div></div>
                    <div className="form-grid">
                      <div className="field">
                        <label htmlFor="origin">Starting location</label>
                        <div className="input-wrap"><MapPin size={17}/><input id="origin" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Bhopal" required /></div>
                      </div>
                      <div className="field">
                        <label htmlFor="destination">Destination</label>
                        <div className="input-wrap"><MapPin size={17}/><input id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Goa" required /></div>
                      </div>
                      <div className="field">
                        <label htmlFor="duration">Trip duration (days)</label>
                        <div className="input-wrap"><CalendarDays size={17}/><input id="duration" type="number" min="1" max="90" value={duration} onChange={e => setDuration(e.target.value)} required /></div>
                      </div>
                      <div className="field">
                        <label htmlFor="travelers">Number of travelers</label>
                        <div className="input-wrap"><Users size={17}/><input id="travelers" type="number" min="1" max="30" value={travelers} onChange={e => setTravelers(e.target.value)} required /></div>
                      </div>
                    </div>
                    <div className="form-grid">

  {/* Season */}
  <div className="field">
    <label htmlFor="season">Travel Season</label>
    <select
      id="season"
      value={season}
      onChange={(e) => setSeason(e.target.value)}
    >
      <option value="Regular">Regular</option>
      <option value="Peak">Peak</option>
      <option value="Off-season">Off-season</option>
    </select>
  </div>

  {/* Transport */}
  <div className="field">
    <label htmlFor="transport">Transport Mode</label>
    <select
      id="transport"
      value={transport}
      onChange={(e) => setTransport(e.target.value)}
    >
      <option value="Train">Train</option>
      <option value="Bus">Bus</option>
      <option value="Car">Car</option>
      <option value="Flight">Flight</option>
    </select>
  </div>

  {/* Distance */}
  <div className="field">
    <label htmlFor="distance">Route Distance (KM)</label>
    <input
      id="distance"
      type="number"
      min="1"
      value={distance}
      onChange={(e) => setDistance(e.target.value)}
      required
    />
  </div>

</div>
                    <fieldset className="stay-field">
                      <legend>Stay preference</legend>
                      <div className="stay-options">
                        {["Budget", "Standard", "Luxury"].map(option => (
                          <label key={option} className={`stay-option ${stay === option ? "selected" : ""}`}>
                            <input type="radio" name="stay" value={option} checked={stay === option} onChange={() => setStay(option)} />
                            <span className="radio-mark"/><span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="form-actions">
                      <button type="submit" className="primary-button"><Sparkles size={17}/> Predict cost</button>
                      <button type="button" className="secondary-button" onClick={saveTrip}><Plus size={17}/> {editingId ? "Update trip" : "Save trip"}</button>
                    </div>
                    <p className="form-footnote"><Clock3 size={14}/> A quick estimate for planning — actual prices may vary.</p>
                  </form>

                  <div className="panel result-panel">
  <div className="result-top">
    <div className="result-coin">
      <Wallet size={25}/>
    </div>

    <div>
      <p className="result-label">Estimated total trip cost</p>
      <div className="result-amount">{money(result.total)}</div>
      <p className="result-sub">
        For {travelers || 0} people · {duration || 0} days · {stay} stay
      </p>
    </div>
  </div>

  <div className="breakdown-head">
  <h3>Cost breakdown</h3>
  <span>Estimated</span>
</div>

<div className="cost-list">
  {breakdown.map(row => (
    <CostRow key={row.title} {...row} />
  ))}
</div>

  <div className="info-note">
    <Sparkles size={17}/>
    <span>{notice}</span>
  </div>

  <button className="text-button" onClick={saveTrip}>
    <Plus size={16}/> Save this trip to My Trips
  </button>
</div>
                </div>
              </section>
            )}

            {(active === "My Trips" || active === "Home") && (
              <section className="page-section trips-section">
                <div className="section-heading">
                  <div><p className="eyebrow">YOUR TRAVEL LIST</p><h2>My Trips</h2><p className="muted">View and manage your planned journeys.</p></div>
                  <button className="primary-button compact" onClick={() => { setEditingId(null); setActive("Predict Trip Cost"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Plus size={17}/> Plan new trip</button>
                </div>
                <div className="panel trips-panel">
                  {trips.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon"><Plane size={25}/></div><h3>No trips yet</h3><p>Your saved trips will appear here.</p><button className="primary-button compact" onClick={() => setActive("Predict Trip Cost")}><Plus size={16}/> Create a trip</button></div>
                  ) : (
                    <div className="table-scroll"><table>
                      <thead><tr><th>Destination</th><th>Duration</th><th>Travelers</th><th>Estimated cost</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>{trips.map(trip => (
                        <tr key={trip.id}>
                          <td><div className="destination-cell"><div className={`destination-thumb thumb-${trip.destination.toLowerCase().replace(/[^a-z]/g, "")}`}><MapPin size={18}/></div><div><strong>{trip.destination}</strong><small>{trip.origin} · {trip.startDate}</small></div></div></td>
                          <td>{trip.duration} days</td><td>{trip.travelers}</td><td className="price-cell">{money(trip.cost)}</td>
                          <td><span className="planned-pill"><CheckCircle2 size={13}/>{trip.status}</span></td>
                          <td><div className="row-actions">
                            <button className="action-btn" title="View trip" aria-label={`View ${trip.destination}`} onClick={() => setSelectedTrip(trip)}><Eye size={16}/></button>
                            <button className="action-btn" title="Edit trip" aria-label={`Edit ${trip.destination}`} onClick={() => editTrip(trip)}><Pencil size={16}/></button>
                            <button className="action-btn danger" title="Delete trip" aria-label={`Delete ${trip.destination}`} onClick={() => deleteTrip(trip.id)}><Trash2 size={16}/></button>
                          </div></td>
                        </tr>
                      ))}</tbody>
                    </table></div>
                  )}
                </div>
              </section>
            )}
            <footer className="footer"><span>© 2026 PackVote AI</span><span>Plan smarter. Travel better.</span></footer>
          </>
        )}
      </main>

      {selectedTrip && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedTrip(null)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="trip-modal-title" onClick={e => e.stopPropagation()}>
            <button className="icon-btn modal-close" onClick={() => setSelectedTrip(null)} aria-label="Close"><X size={19}/></button>
            <div className="modal-icon"><Plane size={23}/></div>
            <p className="eyebrow">TRIP DETAILS</p><h2 id="trip-modal-title">{selectedTrip.origin} to {selectedTrip.destination}</h2>
            <div className="modal-details">
              <div><span>Duration</span><strong>{selectedTrip.duration} days</strong></div>
              <div><span>Travelers</span><strong>{selectedTrip.travelers}</strong></div>
              <div><span>Stay</span><strong>{selectedTrip.stay}</strong></div>
              <div><span>Estimated cost</span><strong>{money(selectedTrip.cost)}</strong></div>
            </div>
            <p className="muted small">Demo trip data. Date and live travel bookings are not connected.</p>
            <button className="primary-button full-width" onClick={() => { editTrip(selectedTrip); setSelectedTrip(null); }}>Edit trip</button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;