const { useState, useMemo } = React;

function safeHTML(s){
  return {__html: s || ""};
}

function Tag({children, onClick}){
  return <button className="tag" onClick={onClick}>{children}</button>
}

function RecipeCard({r, onOpen}){
  return (
    <div className="card">
      {r.photo_url ? <img src={r.photo_url} alt={r.title} className="thumb" /> : null}
      <div className="card-body">
        <h3>{r.title}</h3>
        <div className="meta">
          <span>{r.course || ""}</span>
          <span>{r.serves ? `• ${r.serves} servings` : ""}</span>
        </div>
        <div className="desc" dangerouslySetInnerHTML={safeHTML(r.description)}></div>
        <div className="actions">
          <button className="btn" onClick={() => onOpen(r)}>Voir</button>
        </div>
      </div>
    </div>
  );
}

function Modal({recipe, onClose}){
  if(!recipe) return null;
  return React.createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{recipe.title}</h2>
        {recipe.photo_url ? <img src={recipe.photo_url} alt={recipe.title} className="modal-thumb" /> : null}
        <div className="meta">{recipe.course} {recipe.serves ? `• ${recipe.serves}` : ""}</div>
        <h4>Description</h4>
        <div dangerouslySetInnerHTML={safeHTML(recipe.description)} />
        <h4>Ingredients</h4>
        <ul>
          {recipe.ingredients && recipe.ingredients.map((ing,i)=><li key={i}>{ing}</li>)}
        </ul>
        <h4>Directions</h4>
        <pre className="directions">{recipe.directions}</pre>
      </div>
    </div>,
    document.body
  );
}

function App(){
  const [recipes, setRecipes] = useState(window.__RECIPES__ || []);
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("");
  const [tag, setTag] = useState("");
  const [open, setOpen] = useState(null);

  const courses = useMemo(()=> {
    const c = new Set();
    recipes.forEach(r=> { if(r.course) c.add(r.course); });
    return Array.from(c).sort();
  }, [recipes]);

  const tags = useMemo(()=>{
    const t = new Set();
    recipes.forEach(r=>{
      if(r.tags){
        r.tags.split(",").map(x=>x.trim()).forEach(tt=>tt && t.add(tt));
      }
    });
    return Array.from(t).sort();
  }, [recipes]);

  const filtered = useMemo(()=>{
    return recipes.filter(r=>{
      const matchesQ = q.trim() === "" || (
        (r.title && r.title.toLowerCase().includes(q.toLowerCase())) ||
        (r.description && r.description.toLowerCase().includes(q.toLowerCase())) ||
        (r.ingredients && r.ingredients.join(" ").toLowerCase().includes(q.toLowerCase()))
      );
      const matchesCourse = !course || (r.course === course);
      const matchesTag = !tag || (r.tags && r.tags.toLowerCase().split(",").map(x=>x.trim()).includes(tag.toLowerCase()));
      return matchesQ && matchesCourse && matchesTag;
    });
  }, [recipes,q,course,tag]);

  return (
    <div className="container">
      <header>
        <h1>Recipe Browser</h1>
        <p className="subtitle">Naviguez vos recettes — recherche, filtres par course et tag. Déployable sur GitHub Pages.</p>
      </header>

      <div className="controls">
        <input placeholder="Rechercher (titre, ingrédients...)" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={course} onChange={e=>setCourse(e.target.value)}>
          <option value="">Toutes les courses</option>
          {courses.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={tag} onChange={e=>setTag(e.target.value)}>
          <option value="">Tous les tags</option>
          {tags.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn clear" onClick={()=>{setQ(""); setCourse(""); setTag("");}}>Réinitialiser</button>
      </div>

      <main>
        {filtered.length === 0 ? <p className="empty">Aucune recette trouvée.</p> : null}
        <div className="grid">
          {filtered.map(r=> <RecipeCard key={r.title} r={r} onOpen={(rec)=>setOpen(rec)} />)}
        </div>
      </main>

      <footer>
        <small>Fichier source: plan-to-eat import — {recipes.length} recettes</small>
      </footer>

      <Modal recipe={open} onClose={()=>setOpen(null)} />
    </div>
  );
}

// Load recipes.json into window.__RECIPES__ then render
fetch("recipes.json")
  .then(r=>r.json())
  .then(data=>{
    // normalize keys to match what app expects
    const norm = data.map(item=>{
      return {
        title: item.title || "",
        description: item.description || "",
        serves: item.serves || "",
        photo_url: item.photo_url || item["photo url"] || item["Photo Url"] || item.photo || item['Photo Url'] || item['photo url'],
        prep_time: item.prep_time || item['prep time'] || "",
        cook_time: item.cook_time || item['cook time'] || "",
        course: item.course || "",
        tags: item.tags || "",
        ingredients: item.ingredients || [],
        directions: item.directions || ""
      };
    });
    window.__RECIPES__ = norm;
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  })
  .catch(err=>{
    console.error("Failed to load recipes.json", err);
    ReactDOM.createRoot(document.getElementById('root')).render(<div style={{padding:20}}>Erreur: impossible de charger <code>recipes.json</code>.</div>);
  });
