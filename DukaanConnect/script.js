// SAMPLE DATA
// These example products populate the storefront the first time it is opened.
// Sample catalogue used when the browser has no saved demo data.
const starterProducts=[
 {
    id:1,name:"Grilled Sandwich",price:99,category:"Food",emoji:"🥪",desc:"Toasted, cheesy and satisfying.",available:true
},
 {
    id:2,name:"Cold Coffee",price:79,category:"Drinks",emoji:"☕",desc:"Chilled coffee with a creamy finish.",available:true
},
 {
    id:3,name:"Peri Peri Fries",price:89,category:"Food",emoji:"🍟",desc:"Crispy fries with a spicy kick.",available:true
},
 {
    id:4,name:"Chocolate Cake",price:119,category:"Desserts",emoji:"🍰",desc:"Rich chocolate slice.",available:true
},
 {
    id:5,name:"Fresh Lime Soda",price:59,category:"Drinks",emoji:"🥤",desc:"Refreshing sweet or salty soda.",available:false
},
 {
    id:6,name:"Veggie Wrap",price:109,category:"Food",emoji:"🥗",desc:"Fresh veggies wrapped to go.",available:true
}];
// APPLICATION STATE
// These values power the UI. localStorage is browser-specific, not a shared database.
// Demo state: products and shop profile are stored only in this browser.
let products=JSON.parse(localStorage.getItem("dc_products")||"null")||starterProducts;
let profile=JSON.parse(localStorage.getItem("dc_profile")||"null")|| {
    name:"The Corner Café",description:"Fresh bites, good coffee, and a little neighbourhood comfort.",location:"Kolkata",type:"Café / Restaurant"
};
let cart= {

};
let activeCategory="All";
let onboarding=[];
// Persist demo catalogue and profile to localStorage; this is not a shared database.
// Persist the demo catalogue and shop profile in this browser only.
function save() {
    localStorage.setItem("dc_products",JSON.stringify(products));
    localStorage.setItem("dc_profile",JSON.stringify(profile));

}
// Display a short confirmation message at the bottom of the screen.
// Show a short confirmation message at the bottom of the page.
function showToast(msg) {
    const t=document.getElementById("toast");
    t.textContent=msg;
    t.classList.remove("hidden");
    setTimeout(()=>t.classList.add("hidden"),2400)
}
// Switch between the home page, storefront, shop dashboard, and admin view.
// Switch between the landing page, customer storefront, shop dashboard, and admin area.
function showView(view) {
    ["home","store","dashboard","admin"].forEach(v=> {
        document.getElementById(v+"View").classList.toggle("hidden",v!==view)
    });
    document.querySelectorAll(".navlinks button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
    if(view==="store")renderStore();
    if(view==="dashboard") {
        renderManage();
        loadProfile()
    }
    if(view==="admin") {

    }
    window.scrollTo( {
        top:0,behavior:"smooth"
    })
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=> {
    document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));
    document.querySelectorAll(".tab-content").forEach(x=>x.classList.toggle("hidden",x.id!==b.dataset.tab));
    if(b.dataset.tab==="qrTab")renderQR()
}));
// Render the editable product catalogue in the shopkeeper dashboard.
// Draw the editable product list inside the shopkeeper dashboard.
function renderManage() {
    document.getElementById("productCount").textContent="("+products.length+")";
    document.getElementById("manageProducts").innerHTML=products.map(p=>`<div class="product-row"><div class="product-left"><div class="product-icon">${p.emoji}</div><div><div class="product-name">${esc(p.name)}</div><div class="product-meta">₹${p.price} · ${esc(p.category)}</div></div></div><div style="display:flex;gap:6px;align-items:center"><button class="ghost" style="padding:7px 9px" onclick="editProduct(${p.id})">Edit</button><button class="ghost" style="padding:7px 9px" onclick="toggleStock(${p.id})">${p.available?"In stock":"Restock"}</button><button class="ghost" style="padding:7px 9px" onclick="deleteProduct(${p.id})">×</button></div></div>`).join("")||'<p class="muted">No products yet. Add your first item.</p>'
}
// Render customer-facing products and category filters.
// Draw the customer-facing storefront and category filters from current product data.
function renderStore() {
    document.getElementById("storeName").textContent=profile.name;
    document.getElementById("storeDescription").textContent=profile.description;
    let cats=["All",...new Set(products.map(p=>p.category))];
    document.getElementById("categoryButtons").innerHTML=cats.map(c=>`<button class="${activeCategory===c?'active':''}" onclick="setCategory('${esc(c)}')">${esc(c)}</button>`).join("");
    let list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory));
    document.getElementById("storeProducts").innerHTML=list.map(p=>`<div class="store-product"><div class="product-art">${p.emoji}</div><div class="product-content"><h4>${esc(p.name)}</h4><p>${esc(p.desc||"Freshly prepared for you.")}</p><div class="product-buy"><b>₹${p.price}</b>${p.available?`<button class="primary" onclick="addToCart(${p.id})">＋ Add</button>`:'<span class="stock off">Sold out</span>'}</div></div></div>`).join("")||"<p>No products in this category yet.</p>";
    updateCart()
}
// Update the selected category and refresh the storefront.
// Filter the customer menu to the selected product category.
function setCategory(c) {
    activeCategory=c;
    renderStore()
}
// Add one unit of a product to the customer's local cart.
// Add one unit of a product to the customer's cart.
function addToCart(id) {
    cart[id]=(cart[id]||0)+1;
    updateCart();
    showToast("Added to your cart")
}
// Recalculate cart quantity and total price.
// Recalculate and display the number of cart items and their total price.
function updateCart() {
    let count=Object.values(cart).reduce((a,b)=>a+b,0),total=products.reduce((s,p)=>s+p.price*(cart[p.id]||0),0);
    document.getElementById("cartCount").textContent=count+" item"+(count===1?"":"s");
    document.getElementById("cartTotal").textContent="₹"+total+" total"
}
// Open the order preview modal.
// Open the order review panel and show the cart contents.
function openCart() {
    const modal=document.getElementById("cartModal");
    modal.classList.remove("hidden");
    modal.style.display="flex";
    renderCart()
}
// Close the order preview modal.
// Hide the order review panel.
function closeCart() {
    const modal=document.getElementById("cartModal");
    modal.classList.add("hidden");
    modal.style.display="none"
}
// Show cart lines, quantity controls, and the estimated total.
// List cart items with quantity controls and calculate the order total.
function renderCart() {
    let chosen=products.filter(p=>cart[p.id]);
    document.getElementById("cartItems").innerHTML=chosen.length?chosen.map(p=>`<div class="cart-item"><div><b>${esc(p.name)}</b><div class="micro">₹${p.price} each</div></div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><b>${cart[p.id]}</b><button onclick="changeQty(${p.id},1)">+</button></div></div>`).join(""):'<p class="muted">Your cart is empty. Add something from the menu.</p>';
    document.getElementById("modalTotal").textContent="Total: ₹"+chosen.reduce((s,p)=>s+p.price*cart[p.id],0)
}
// Increase or decrease the quantity of a cart item.
// Increase or decrease a cart item quantity; remove it when quantity reaches zero.
function changeQty(id,delta) {
    cart[id]=(cart[id]||0)+delta;
    if(cart[id]<=0)delete cart[id];
    renderCart();
    updateCart()
}
// Simulate order submission; no real order is sent in this prototype.
// Preview the checkout flow; this prototype does not send a real order anywhere.
function placeDemoOrder() {
    if(!Object.values(cart).some(v=>v>0)) {
        showToast("Your cart is empty");
        return
    }
    showToast("Demo order previewed — backend needed to submit");
    closeCart();
    cart= {

    };
    updateCart()
}
// Product form: create a product or update the product currently being edited.
document.getElementById("productForm").addEventListener("submit",e=> {
    e.preventDefault();
    const id=Number(document.getElementById("editId").value);
    const p= {
        id:id||Date.now(),name:document.getElementById("pName").value.trim(),price:Number(document.getElementById("pPrice").value),category:document.getElementById("pCategory").value,emoji:document.getElementById("pEmoji").value,desc:document.getElementById("pDesc").value.trim(),available:true
    };
    if(id) {
        const old=products.find(x=>x.id===id);
        p.available=old?old.available:true;
        products=products.map(x=>x.id===id?p:x);
        showToast("Product updated")
    }
    else {
        products.push(p);
        showToast("Product added")
    };
    save();
    resetProductForm();
    renderManage();
    renderStore()
});
// Load a product into the form so it can be edited.
// Copy an existing product into the form so the shopkeeper can edit it.
function editProduct(id) {
    const p=products.find(x=>x.id===id);
    if(!p)return;
    document.getElementById("editId").value=p.id;
    document.getElementById("pName").value=p.name;
    document.getElementById("pPrice").value=p.price;
    document.getElementById("pCategory").value=p.category;
    document.getElementById("pEmoji").value=p.emoji;
    document.getElementById("pDesc").value=p.desc||"";
    document.getElementById("productFormTitle").textContent="✎ Edit product";
    document.getElementById("saveProductBtn").textContent="Save changes";
    document.getElementById("pName").focus()
}
// Clear the form and return it to add-product mode.
// Clear the product form and return it to add-new-product mode.
function resetProductForm() {
    document.getElementById("productForm").reset();
    document.getElementById("editId").value="";
    document.getElementById("productFormTitle").textContent="＋ Add a product";
    document.getElementById("saveProductBtn").textContent="Add product"
}
// Toggle product availability and refresh both views.
// Switch a product between available and unavailable.
function toggleStock(id) {
    products=products.map(p=>p.id===id? {
        ...p,available:!p.available
    }
    :p);
    save();
    renderManage();
    renderStore();
    showToast("Availability updated")
}
// Remove a product after user confirmation.
// Remove a product from the demo catalogue after confirmation.
function deleteProduct(id) {
    if(!confirm("Delete this product from the demo catalogue?"))return;
    products=products.filter(p=>p.id!==id);
    delete cart[id];
    save();
    renderManage();
    renderStore();
    showToast("Product deleted")
}
// Fill the profile form with the currently saved shop details.
// Fill the profile form with the current shop details.
function loadProfile() {
    document.getElementById("shopNameInput").value=profile.name;
    document.getElementById("shopDescInput").value=profile.description;
    document.getElementById("shopLocationInput").value=profile.location;
    document.getElementById("shopTypeInput").value=profile.type
}
// Shop profile form: save the public name, description, location, and business type.
document.getElementById("profileForm").addEventListener("submit",e=> {
    e.preventDefault();
    profile= {
        name:document.getElementById("shopNameInput").value.trim(),description:document.getElementById("shopDescInput").value.trim(),location:document.getElementById("shopLocationInput").value.trim(),type:document.getElementById("shopTypeInput").value
    };
    save();
    renderStore();
    renderQR();
    showToast("Shop profile saved")
});
// Draw a decorative QR-like preview. It is not a scannable QR code.
// Draw a decorative QR-like preview; it is not a scannable production QR code.
function renderQR() {
    const target=document.getElementById("qrVisual");
    let seed=(profile.name||"DukaanConnect").split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    let cells="";
    for(let y=0;
    y<21;
    y++)for(let x=0;
    x<21;
    x++) {
        let v=(x*13+y*7+seed+x*y)%5;
        if(v<2||((x<7&&y<7)||(x>13&&y<7)||(x<7&&y>13))) {
            let inFinder=(x<7&&y<7)||(x>13&&y<7)||(x<7&&y>13);
            if(inFinder) {
                let xx=x<7?x:x-14,yy=y<7?y:y-14;
                v=(xx===0||xx===6||yy===0||yy===6||(xx>=2&&xx<=4&&yy>=2&&yy<=4))?0:4;
                if(v===0)cells+=`<rect x="${x}" y="${y}" width="1" height="1" fill="#17211b"/>`
            }
            else cells+=`<rect x="${x}" y="${y}" width="1" height="1" fill="#17211b"/>`
        }

    }
    target.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" shape-rendering="crispEdges"><rect width="21" height="21" fill="white"/>${cells}</svg>`;
    document.getElementById("qrShopLabel").textContent=profile.name
}
// Explain that a real QR generator is needed for production use.
// Explain that a real QR generator is needed before production deployment.
function downloadQR() {
    showToast("Demo QR pattern only — use a real QR generator after deployment")
}
// Copy a demo URL where clipboard access is available.
// Copy a demo URL to the clipboard when the browser supports it.
function copyStoreLink() {
    const url=location.href.split("#")[0]+"#shop-demo";
    if(navigator.clipboard) {
        navigator.clipboard.writeText(url).then(()=>showToast("Demo link copied")).catch(()=>showToast(url))
    }
    else showToast(url)
}
// Admin onboarding form: add a shop request to this browser session for demonstration.
document.getElementById("onboardForm").addEventListener("submit",e=> {
    e.preventDefault();
    const n=document.getElementById("newShopName").value.trim(),owner=document.getElementById("ownerName").value.trim(),phone=document.getElementById("ownerPhone").value.trim(),type=document.getElementById("newShopType").value,area=document.getElementById("ownerArea").value.trim();
    onboarding.unshift( {
        n,owner,phone,type,area
    });
    document.getElementById("onboardList").innerHTML=onboarding.map(s=>`<div class="product-row"><div><div class="product-name">${esc(s.n)}</div><div class="product-meta">${esc(s.type)} · ${esc(s.area||"Area not added")} · ${esc(s.owner)}</div></div><span class="stock off">New</span></div>`).join("")+document.getElementById("onboardList").innerHTML;
    e.target.reset();
    showToast("Added to this session's demo list")
});
// Escape user-entered text before inserting it into HTML templates.
// Escape user-entered text before inserting it into HTML, reducing injection risk.
function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}
renderStore();renderManage();loadProfile();renderQR();
