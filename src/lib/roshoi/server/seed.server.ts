import { getSql } from "@/lib/db";
import { calculateOrderEconomics } from "@/lib/roshoi/finance/settlement";
import {
  DEFAULT_BRANDING,
  DEFAULT_ORG_ID,
  DEFAULT_SETTINGS,
  FEATURE_FLAG_KEYS,
} from "@/lib/roshoi/types";
import type { OrderStatus } from "@/lib/roshoi/orders/state-machine";

const SEED_VERSION = 2;

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)] as T;
}

function pad(n: number, w = 3) {
  return String(n).padStart(w, "0");
}

const RESTAURANT_DEFS: { name: string; cuisine: string; area: string; veg: boolean }[] = [
  { name: "Al-Amin Restaurant", cuisine: "Mughlai", area: "Station Road", veg: false },
  { name: "Shillong Momo Corner", cuisine: "Tibetan", area: "Central", veg: false },
  { name: "Surma Biryani House", cuisine: "Biryani", area: "Longai Road", veg: false },
  { name: "Sribhumi Thali", cuisine: "Bengali", area: "Sribhumi North", veg: false },
  { name: "Border Tea & Snacks", cuisine: "Snacks", area: "Central", veg: true },
  { name: "Karimganj Pizza Co", cuisine: "Pizza", area: "Station Road", veg: true },
  { name: "Green Leaf Veg Kitchen", cuisine: "Vegetarian", area: "Central", veg: true },
  { name: "Fish House Barak", cuisine: "Fish", area: "Longai Road", veg: false },
  { name: "Night Owl Rolls", cuisine: "Rolls", area: "Station Road", veg: false },
  { name: "Spice Route Indian", cuisine: "North Indian", area: "Badarpur Road", veg: false },
  { name: "Café 37", cuisine: "Cafe", area: "Central", veg: true },
  { name: "Noodle Bar East", cuisine: "Chinese", area: "Sribhumi North", veg: false },
  { name: "Royal Mughlai", cuisine: "Mughlai", area: "Station Road", veg: false },
  { name: "Healthy Bowl", cuisine: "Bowls", area: "Central", veg: true },
  { name: "Dosa Point", cuisine: "South Indian", area: "Badarpur Road", veg: true },
  { name: "Grill & Shawarma", cuisine: "Grill", area: "Longai Road", veg: false },
  { name: "Sweet Bengal", cuisine: "Mishti", area: "Central", veg: true },
  { name: "Mama's Kitchen", cuisine: "Home-style", area: "Sribhumi North", veg: false },
  { name: "Hill View Chinese", cuisine: "Chinese", area: "Station Road", veg: false },
  { name: "Station Road Dhaba", cuisine: "Dhaba", area: "Station Road", veg: false },
  { name: "The Curry Leaf", cuisine: "Indian", area: "Badarpur Road", veg: false },
  { name: "Biryani Express", cuisine: "Biryani", area: "Longai Road", veg: false },
  { name: "Wok This Way", cuisine: "Pan-Asian", area: "Central", veg: false },
  { name: "Morning Glory Bakery", cuisine: "Bakery", area: "Central", veg: true },
  { name: "Lake View Family Kitchen", cuisine: "Family", area: "Sribhumi North", veg: false },
];

const SILCHAR_RESTAURANTS = [
  { name: "Silchar Biryani Lab", cuisine: "Biryani", area: "Silchar" },
  { name: "Barak Bridge Cafe", cuisine: "Cafe", area: "Silchar" },
  { name: "Cachar Grill", cuisine: "Grill", area: "Silchar" },
];

const FIRST = [
  "Ayesha",
  "Rahul",
  "Nusrat",
  "Arif",
  "Priya",
  "Imran",
  "Sana",
  "Deepak",
  "Farhana",
  "Rishi",
  "Mehnaz",
  "Kabir",
  "Ananya",
  "Tariq",
  "Ishita",
];
const LAST = ["Ahmed", "Das", "Choudhury", "Islam", "Nath", "Barbhuiya", "Roy", "Khan", "Dey", "Paul"];

const DISHES: Record<string, string[]> = {
  Mughlai: ["Butter chicken", "Mutton korma", "Roomali roti", "Biryani"],
  Tibetan: ["Chicken momo", "Veg momo", "Thukpa", "Chilli chicken"],
  Biryani: ["Chicken biryani", "Mutton biryani", "Egg biryani", "Raita"],
  Bengali: ["Shorshe ilish", "Kosha mangsho", "Aloo posto", "Rice thali"],
  Snacks: ["Samosa", "Singara", "Tea", "Puffed rice mix"],
  Pizza: ["Margherita", "Farmhouse", "Chicken tikka pizza", "Garlic bread"],
  Vegetarian: ["Paneer butter masala", "Dal tadka", "Jeera rice", "Roti"],
  Fish: ["Fish curry", "Fried rohu", "Rice", "Aloo bhaja"],
  Rolls: ["Chicken roll", "Egg roll", "Paneer roll", "Kathi kebab"],
  "North Indian": ["Butter naan", "Dal makhani", "Chicken tikka", "Salad"],
  Cafe: ["Filter coffee", "Sandwich", "Brownie", "Lemon iced tea"],
  Chinese: ["Hakka noodles", "Chilli chicken", "Fried rice", "Manchurian"],
  Bowls: ["Quinoa bowl", "Chicken protein bowl", "Curd rice", "Salad"],
  "South Indian": ["Masala dosa", "Idli sambar", "Filter coffee", "Vada"],
  Grill: ["Chicken shawarma", "Seekh kebab", "Garlic sauce", "Fries"],
  Mishti: ["Rasgulla", "Sandesh", "Mishti doi", "Kalakand"],
  "Home-style": ["Chicken curry", "Rice", "Mixed veg", "Dal"],
  Dhaba: ["Dal fry", "Tandoori roti", "Egg curry", "Lassi"],
  Indian: ["Kadai paneer", "Naan", "Jeera rice", "Raita"],
  "Pan-Asian": ["Pad thai", "Spring roll", "Thai curry", "Jasmine rice"],
  Bakery: ["Chicken puff", "Fruit cake", "Croissant", "Bread"],
  Family: ["Family thali", "Chicken roast", "Veg fry", "Payesh"],
};

const ZONE_DEFS = [
  { id: "zone_central", name: "Karimganj Central", fee: 2500, min: 8000, eta: 30, lat: 24.869, lng: 92.355 },
  { id: "zone_station", name: "Station Road", fee: 3000, min: 10000, eta: 35, lat: 24.861, lng: 92.352 },
  { id: "zone_sribhumi", name: "Sribhumi North", fee: 3500, min: 12000, eta: 40, lat: 24.88, lng: 92.36 },
  { id: "zone_badarpur", name: "Badarpur Road", fee: 4000, min: 12000, eta: 45, lat: 24.85, lng: 92.37 },
  { id: "zone_longai", name: "Longai Road", fee: 3000, min: 10000, eta: 35, lat: 24.87, lng: 92.34 },
];

function zoneForArea(area: string): string {
  if (area === "Station Road") return "zone_station";
  if (area === "Sribhumi North") return "zone_sribhumi";
  if (area === "Badarpur Road") return "zone_badarpur";
  if (area === "Longai Road") return "zone_longai";
  if (area === "Silchar") return "zone_silchar";
  return "zone_central";
}

async function exec(text: string, params: unknown[] = []) {
  const sql = await getSql();
  return sql.query(text, params);
}

export async function seedIfNeeded(): Promise<void> {
  const sql = await getSql();
  const existing = await sql<{ seed_version: number }>`
    select seed_version from workspace_meta where org_id = ${DEFAULT_ORG_ID}
  `;
  const version = existing[0]?.seed_version ?? 0;
  if (version >= SEED_VERSION) return;
  if (version < 1) {
    await seedV1();
  }
  if (version < 2) {
    await seedV2();
  }
  await exec(
    `insert into workspace_meta (org_id, seed_version, seeded_at, data_mode)
     values ($1,$2,now(),'SIMULATED')
     on conflict (org_id) do update set seed_version = excluded.seed_version, seeded_at = excluded.seeded_at`,
    [DEFAULT_ORG_ID, SEED_VERSION],
  );
}

async function seedV1(): Promise<void> {
  const sql = await getSql();
  const rand = rng(20260901);
  const now = Date.now();

  await exec(
    `insert into organizations (id, name, legal_name, tagline, data_mode)
     values ($1,$2,$3,$4,'SIMULATED')
     on conflict (id) do nothing`,
    [DEFAULT_ORG_ID, "Roshoi", "Roshoi Foods Private Limited", "The kitchen, delivered."],
  );

  await exec(
    `insert into cities (id, org_id, name, state, country, status) values
     ('city_karimganj',$1,'Karimganj','Assam','IN','ACTIVE'),
     ('city_silchar',$1,'Silchar','Assam','IN','ACTIVE')
     on conflict (id) do nothing`,
    [DEFAULT_ORG_ID],
  );

  for (const z of ZONE_DEFS) {
    await exec(
      `insert into zones (id, org_id, city_id, name, geometry_json, delivery_fee_paise, min_order_paise, max_radius_km, eta_minutes)
       values ($1,$2,'city_karimganj',$3,$4,$5,$6,6,$7)
       on conflict (id) do nothing`,
      [
        z.id,
        DEFAULT_ORG_ID,
        z.name,
        JSON.stringify({
          type: "radius",
          center: { lat: z.lat, lng: z.lng },
          radiusKm: 4,
        }),
        z.fee,
        z.min,
        z.eta,
      ],
    );
  }
  await exec(
    `insert into zones (id, org_id, city_id, name, geometry_json, delivery_fee_paise, min_order_paise, max_radius_km, eta_minutes)
     values ('zone_silchar',$1,'city_silchar','Silchar Central',$2,3500,12000,6,40)
     on conflict (id) do nothing`,
    [
      DEFAULT_ORG_ID,
      JSON.stringify({ type: "radius", center: { lat: 24.833, lng: 92.779 }, radiusKm: 5 }),
    ],
  );

  const allRestaurants = [
    ...RESTAURANT_DEFS.map((r, i) => ({
      ...r,
      id: `rst_${pad(i + 1)}`,
      cityId: "city_karimganj",
      zoneId: zoneForArea(r.area),
    })),
    ...SILCHAR_RESTAURANTS.map((r, i) => ({
      ...r,
      veg: false,
      id: `rst_s${pad(i + 1)}`,
      cityId: "city_silchar",
      zoneId: "zone_silchar",
    })),
  ];

  const statuses = [
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "PAUSED",
    "PENDING_REVIEW",
    "ACTIVE",
  ] as const;

  for (let i = 0; i < allRestaurants.length; i++) {
    const r = allRestaurants[i]!;
    const status = i === 6 ? "PENDING_REVIEW" : i === 5 ? "PAUSED" : pick(rand, statuses);
    const kyc = status === "PENDING_REVIEW" ? "UNDER_REVIEW" : "VERIFIED";
    await exec(
      `insert into restaurants (
        id, org_id, city_id, zone_id, name, slug, cuisine, address, phone_masked,
        legal_name, kyc_status, payout_status, status, commission_bps, rating_x10,
        prep_minutes, hours_json, data_mode
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,1000,$14,$15,$16,'SIMULATED')
      on conflict (id) do nothing`,
      [
        r.id,
        DEFAULT_ORG_ID,
        r.cityId,
        r.zoneId,
        r.name,
        r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        r.cuisine,
        `${r.area}, ${r.cityId === "city_silchar" ? "Silchar" : "Karimganj"}, Assam`,
        `+91 9xxxx xx${pad(20 + i, 2)}`,
        `${r.name} (Prop.)`,
        kyc,
        kyc === "VERIFIED" ? "READY" : "PENDING",
        status,
        40 + Math.floor(rand() * 10),
        12 + Math.floor(rand() * 18),
        JSON.stringify({
          mon: ["10:00", "22:00"],
          tue: ["10:00", "22:00"],
          wed: ["10:00", "22:00"],
          thu: ["10:00", "22:00"],
          fri: ["10:00", "23:00"],
          sat: ["10:00", "23:00"],
          sun: ["11:00", "22:00"],
        }),
      ],
    );

    const dishes = DISHES[r.cuisine] ?? DISHES.Indian ?? ["Thali"];
    for (let d = 0; d < dishes.length; d++) {
      await exec(
        `insert into menu_items (id, org_id, restaurant_id, category, name, price_paise, available, veg)
         values ($1,$2,$3,$4,$5,$6,1,$7) on conflict (id) do nothing`,
        [
          `mi_${r.id}_${d}`,
          DEFAULT_ORG_ID,
          r.id,
          d === dishes.length - 1 ? "Sides" : "Mains",
          dishes[d],
          8000 + Math.floor(rand() * 28000),
          r.veg || d % 2 === 0 ? 1 : 0,
        ],
      );
    }

    await exec(
      `insert into kyc_cases (id, org_id, subject_type, subject_id, status, notes, document_refs_json)
       values ($1,$2,'restaurant',$3,$4,$5,$6) on conflict (id) do nothing`,
      [
        `kyc_${r.id}`,
        DEFAULT_ORG_ID,
        r.id,
        kyc === "VERIFIED" ? "VERIFIED" : "UNDER_REVIEW",
        kyc === "VERIFIED"
          ? "Documents reviewed in operations. Window 4 does not claim third-party KYC verification."
          : "Awaiting operator review. Not verified.",
        JSON.stringify([
          { label: "FSSAI / trade license", ref: `doc_${r.id}_license` },
          { label: "Owner ID (masked)", ref: `doc_${r.id}_id` },
        ]),
      ],
    );
  }

  for (let i = 1; i <= 32; i++) {
    const cityId = i > 28 ? "city_silchar" : "city_karimganj";
    const zoneId = cityId === "city_silchar" ? "zone_silchar" : ZONE_DEFS[(i - 1) % ZONE_DEFS.length]!.id;
    const online = i % 5 !== 0;
    const busy = online && i % 3 === 0;
    const status = i <= 2 ? "UNDER_REVIEW" : busy ? "BUSY" : online ? "ONLINE" : "OFFLINE";
    const z = ZONE_DEFS.find((x) => x.id === zoneId) ?? ZONE_DEFS[0]!;
    await exec(
      `insert into riders (
        id, org_id, city_id, zone_id, name, phone_masked, vehicle, kyc_status, status,
        online, lat, lng, rating_x10, cash_collected_paise, cash_reconciled_paise, data_mode
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'SIMULATED')
      on conflict (id) do nothing`,
      [
        `rdr_${pad(i)}`,
        DEFAULT_ORG_ID,
        cityId,
        zoneId,
        `${pick(rand, FIRST)} ${pick(rand, LAST)}`,
        `+91 8xxxx xx${pad(i)}`,
        pick(rand, ["Bike", "Scooter", "Bike"]),
        i <= 2 ? "PENDING" : "VERIFIED",
        status,
        online ? 1 : 0,
        z.lat + (rand() - 0.5) * 0.02,
        z.lng + (rand() - 0.5) * 0.02,
        42 + Math.floor(rand() * 10),
        busy ? 150000 + Math.floor(rand() * 80000) : 0,
        0,
      ],
    );
    if (i <= 2) {
      await exec(
        `insert into kyc_cases (id, org_id, subject_type, subject_id, status, notes, document_refs_json)
         values ($1,$2,'rider',$3,'PENDING','Identity documents uploaded. Not verified.', $4)
         on conflict (id) do nothing`,
        [
          `kyc_rdr_${pad(i)}`,
          DEFAULT_ORG_ID,
          `rdr_${pad(i)}`,
          JSON.stringify([
            { label: "Driving licence (masked)", ref: `doc_rdr_${pad(i)}_dl` },
            { label: "Photo", ref: `doc_rdr_${pad(i)}_photo` },
          ]),
        ],
      );
    }
  }

  for (let i = 1; i <= 48; i++) {
    await exec(
      `insert into customers (
        id, org_id, city_id, display_ref, phone_masked, status, loyalty_tier,
        order_count, risk_score, data_mode
      ) values ($1,$2,$3,$4,$5,'ACTIVE',$6,$7,$8,'SIMULATED')
      on conflict (id) do nothing`,
      [
        `cus_${pad(i)}`,
        DEFAULT_ORG_ID,
        i > 44 ? "city_silchar" : "city_karimganj",
        `C-${1000 + i}`,
        `+91 7xxxx xx${pad(i)}`,
        i % 11 === 0 ? "GOLD" : i % 5 === 0 ? "SILVER" : "NONE",
        1 + Math.floor(rand() * 12),
        i === 7 || i === 19 ? 72 : Math.floor(rand() * 18),
      ],
    );
  }

  const karimganjRsts = allRestaurants.filter((r) => r.cityId === "city_karimganj");
  const flow: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "RIDER_ASSIGNED",
    "PICKED_UP",
    "ON_THE_WAY",
    "ARRIVING",
    "DELIVERED",
    "DELIVERED",
    "DELIVERED",
    "DELIVERED",
    "CANCELLED",
    "REFUND_PENDING",
    "REFUNDED",
  ];

  const menuCache = new Map<string, { id: string; name: string; price_paise: number }[]>();
  const menuRows = await sql<{ id: string; restaurant_id: string; name: string; price_paise: number }>`
    select id, restaurant_id, name, price_paise from menu_items
  `;
  for (const row of menuRows) {
    const list = menuCache.get(row.restaurant_id) ?? [];
    list.push(row);
    menuCache.set(row.restaurant_id, list);
  }

  for (let i = 1; i <= 110; i++) {
    const rst = karimganjRsts[(i - 1) % karimganjRsts.length]!;
    const status = i <= 8 ? flow[i - 1]! : i <= 18 ? "DELIVERED" : pick(rand, flow);
    const isToday = i <= 70;
    const placed = new Date(now - (isToday ? rand() * 10 * 3600_000 : (1 + rand() * 6) * 86400_000));
    const promised = new Date(placed.getTime() + (25 + Math.floor(rand() * 25)) * 60_000);
    const delayed = ["PREPARING", "READY", "RIDER_ASSIGNED", "ON_THE_WAY"].includes(status) && i % 4 === 0;
    if (delayed) promised.setMinutes(promised.getMinutes() - 40);
    const items = (menuCache.get(rst.id) ?? []).slice(0, 1 + Math.floor(rand() * 3));
    const qtyItems = items.map((it) => ({
      ...it,
      qty: 1 + Math.floor(rand() * 2),
    }));
    const food = qtyItems.reduce((s, it) => s + it.price_paise * it.qty, 0) || 18000;
    const restDisc = i % 9 === 0 ? 2000 : 0;
    const platDisc = i % 7 === 0 ? 1500 : 0;
    const zone = ZONE_DEFS.find((z) => z.id === rst.zoneId) ?? ZONE_DEFS[0]!;
    const cod = i % 5 === 0;
    const eco = calculateOrderEconomics({
      foodPaise: food,
      restaurantDiscountPaise: restDisc,
      platformDiscountPaise: platDisc,
      deliveryFeePaise: zone.fee,
      serviceFeePaise: DEFAULT_SETTINGS.serviceFeePaise,
      taxPaise: Math.round(food * 0.025),
      commissionBps: DEFAULT_SETTINGS.commissionBps,
      paymentFeeBps: DEFAULT_SETTINGS.paymentFeeBps,
      riderBasePaise: DEFAULT_SETTINGS.riderBasePaise,
      riderDistancePaise: DEFAULT_SETTINGS.riderDistancePaise,
      riderIncentivePaise: i % 11 === 0 ? 1000 : 0,
      cashCollectedPaise: cod ? food + zone.fee + DEFAULT_SETTINGS.serviceFeePaise - platDisc : 0,
      refundPaise: status === "REFUNDED" || status === "REFUND_PENDING" ? food : 0,
    });
    const needsRider = [
      "RIDER_ASSIGNED",
      "PICKED_UP",
      "ON_THE_WAY",
      "ARRIVING",
      "DELIVERED",
    ].includes(status);
    const riderId = needsRider ? `rdr_${pad(((i - 1) % 26) + 3)}` : null;
    const paymentStatus =
      status === "PAYMENT_FAILED" ? "FAILED" : status === "PENDING" && !cod ? "AUTHORIZED" : "PAID";

    await exec(
      `insert into orders (
        id, org_id, city_id, zone_id, restaurant_id, customer_id, rider_id, status,
        payment_status, payment_method, food_paise, restaurant_discount_paise, platform_discount_paise,
        delivery_fee_paise, service_fee_paise, tax_paise, total_paise, commission_paise,
        payment_fee_paise, rider_payout_paise, refund_paise, promised_at, placed_at,
        confirmed_at, delivered_at, cancelled_at, data_mode
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,'SIMULATED'
      ) on conflict (id) do nothing`,
      [
        `ROS-KRM-${pad(i, 4)}`,
        DEFAULT_ORG_ID,
        "city_karimganj",
        rst.zoneId,
        rst.id,
        `cus_${pad(((i - 1) % 44) + 1)}`,
        riderId,
        status,
        paymentStatus,
        cod ? "COD" : "UPI",
        food,
        restDisc,
        platDisc,
        zone.fee,
        DEFAULT_SETTINGS.serviceFeePaise,
        Math.round(food * 0.025),
        eco.customerTotalPaise,
        eco.commissionPaise,
        eco.paymentFeePaise,
        eco.riderPayablePaise,
        status === "REFUNDED" || status === "REFUND_PENDING" ? food : 0,
        promised.toISOString(),
        placed.toISOString(),
        status === "PENDING" ? null : new Date(placed.getTime() + 4 * 60_000).toISOString(),
        status === "DELIVERED" ? new Date(placed.getTime() + 38 * 60_000).toISOString() : null,
        status === "CANCELLED" ? new Date(placed.getTime() + 9 * 60_000).toISOString() : null,
      ],
    );

    for (let k = 0; k < qtyItems.length; k++) {
      const it = qtyItems[k]!;
      await exec(
        `insert into order_items (id, org_id, order_id, menu_item_id, name, qty, unit_paise)
         values ($1,$2,$3,$4,$5,$6,$7) on conflict (id) do nothing`,
        [`oi_${pad(i)}_${k}`, DEFAULT_ORG_ID, `ROS-KRM-${pad(i, 4)}`, it.id, it.name, it.qty, it.price_paise],
      );
    }

    await exec(
      `insert into order_events (id, org_id, order_id, from_status, to_status, action, note)
       values ($1,$2,$3,null,$4,'created','SIMULATED marketplace event')
       on conflict (id) do nothing`,
      [`ev_${pad(i)}_0`, DEFAULT_ORG_ID, `ROS-KRM-${pad(i, 4)}`, status],
    );

    if (status === "DELIVERED" || status === "REFUNDED") {
      for (let li = 0; li < eco.lines.length; li++) {
        const line = eco.lines[li]!;
        await exec(
          `insert into ledger_entries (
            id, org_id, order_id, restaurant_id, rider_id, party, kind, source, rule_key, amount_paise, note, created_at
          ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict (id) do nothing`,
          [
            `led_${pad(i)}_${li}`,
            DEFAULT_ORG_ID,
            `ROS-KRM-${pad(i, 4)}`,
            rst.id,
            riderId,
            line.kind.startsWith("rider") || line.kind === "cash_collected" ? "RIDER" : "RESTAURANT",
            line.kind,
            line.source,
            line.ruleKey,
            line.amountPaise,
            line.note ?? "SIMULATED ledger",
            placed.toISOString(),
          ],
        );
      }
    }
  }

  const ticketDefs: [string, string, string, string][] = [
    ["customer", "missing_item", "OPEN", "Missing raita in order"],
    ["customer", "late_delivery", "IN_PROGRESS", "Order delayed over 40 minutes"],
    ["customer", "refund", "WAITING", "Customer requesting refund for cold food"],
    ["customer", "wrong_item", "ASSIGNED", "Received veg instead of chicken"],
    ["restaurant", "settlement_question", "OPEN", "Commission on last payout unclear"],
    ["restaurant", "menu_issue", "IN_PROGRESS", "Item showing unavailable incorrectly"],
    ["restaurant", "onboarding", "OPEN", "Need help completing KYC"],
    ["rider", "cash_issue", "OPEN", "COD mismatch of ₹120"],
    ["rider", "safety", "IN_PROGRESS", "Customer location hard to find after dark"],
    ["rider", "app_problem", "WAITING", "Offer cards not loading"],
    ["customer", "payment_issue", "RESOLVED", "UPI pending then captured"],
    ["restaurant", "delivery_problem", "OPEN", "Riders not arriving after ready"],
  ];
  for (let i = 0; i < ticketDefs.length; i++) {
    const [queue, category, status, subject] = ticketDefs[i]!;
    await exec(
      `insert into tickets (
        id, org_id, city_id, queue, category, status, priority, subject,
        customer_id, restaurant_id, rider_id, order_id, sla_minutes, data_mode
      ) values ($1,$2,'city_karimganj',$3,$4,$5,$6,$7,$8,$9,$10,$11,30,'SIMULATED')
      on conflict (id) do nothing`,
      [
        `tkt_${pad(i + 1)}`,
        DEFAULT_ORG_ID,
        queue,
        category,
        status,
        i === 8 ? "CRITICAL" : i % 3 === 0 ? "HIGH" : "MEDIUM",
        subject,
        queue === "customer" ? `cus_${pad(i + 1)}` : null,
        queue === "restaurant" ? `rst_${pad(i + 1)}` : `rst_${pad(1)}`,
        queue === "rider" ? `rdr_${pad(i + 3)}` : null,
        `ROS-KRM-${pad(i + 1, 4)}`,
      ],
    );
    await exec(
      `insert into ticket_messages (id, ticket_id, org_id, visibility, author_type, body)
       values ($1,$2,$3,'public','customer',$4) on conflict (id) do nothing`,
      [`tm_${pad(i + 1)}_1`, `tkt_${pad(i + 1)}`, DEFAULT_ORG_ID, subject],
    );
    await exec(
      `insert into ticket_messages (id, ticket_id, org_id, visibility, author_type, body)
       values ($1,$2,$3,'internal','system',$4) on conflict (id) do nothing`,
      [
        `tm_${pad(i + 1)}_2`,
        `tkt_${pad(i + 1)}`,
        DEFAULT_ORG_ID,
        "Internal note: do not expose this message outside operations.",
      ],
    );
  }

  const promos = [
    ["promo_first", "First order ₹50 off", "FIXED", "PLATFORM", 5000, "ACTIVE"],
    ["promo_rain", "Rainy day 10%", "PERCENT", "SHARED", 0, "ACTIVE"],
    ["promo_lunch", "Lunch under 20 min", "PERCENT", "RESTAURANT", 0, "DRAFT"],
    ["promo_unlimited", "UNLIMITED TEST (blocked)", "PERCENT", "PLATFORM", 0, "DRAFT"],
  ] as const;
  for (const p of promos) {
    await exec(
      `insert into promotions (id, org_id, name, kind, funding, percent_bps, fixed_paise, min_order_paise, max_discount_paise, first_order_only, status, estimated_cost_paise, cap_count)
       values ($1,$2,$3,$4,$5,$6,$7,15000,$8,$9,$10,$11,$12)
       on conflict (id) do nothing`,
      [
        p[0],
        DEFAULT_ORG_ID,
        p[1],
        p[2],
        p[3],
        p[2] === "PERCENT" ? 1000 : null,
        p[2] === "FIXED" ? p[4] : 0,
        8000,
        p[0] === "promo_first" ? 1 : 0,
        p[5],
        120000,
        p[0] === "promo_unlimited" ? 50 : 500,
      ],
    );
  }

  await exec(
    `insert into loyalty_programs (id, org_id, name, kind, earn_bps, cap_paise, status, rules_json)
     values ('loy_points',$1,'Roshoi Points','points',200,20000,'ACTIVE',$2)
     on conflict (id) do nothing`,
    [DEFAULT_ORG_ID, JSON.stringify({ minOrderPaise: 15000, expiryDays: 90, abuseCapPerDay: 3 })],
  );

  const cms = [
    ["customer", "home_hero", "Karimganj eats, without the noise", 0],
    ["customer", "banner", "Ramadan hours — check before you order", 0],
    ["customer", "featured", "Sribhumi Thali", 0],
    ["customer", "featured", "Surma Biryani House — sponsored", 1],
    ["restaurant", "help", "How settlements are calculated", 0],
    ["rider", "help", "COD handover checklist", 0],
    ["admin", "faq", "What is simulated data?", 0],
    ["customer", "policy", "Cancellation policy", 0],
  ] as const;
  for (let i = 0; i < cms.length; i++) {
    const c = cms[i]!;
    await exec(
      `insert into cms_entries (id, org_id, surface, slot, title, body, sponsored, sort_order, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'PUBLISHED') on conflict (id) do nothing`,
      [`cms_${pad(i + 1)}`, DEFAULT_ORG_ID, c[0], c[1], c[2], c[2], c[3], i],
    );
  }

  await exec(
    `insert into branding (
      org_id, app_name, color_bg, color_fg, color_primary, color_primary_fg, color_accent,
      tagline, app_store_name, notification_sender, invoice_branding, customer_branding,
      restaurant_branding, rider_branding, admin_branding, legal_company_name, support_email, support_phone
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    on conflict (org_id) do nothing`,
    [
      DEFAULT_ORG_ID,
      DEFAULT_BRANDING.appName,
      DEFAULT_BRANDING.colorBg,
      DEFAULT_BRANDING.colorFg,
      DEFAULT_BRANDING.colorPrimary,
      DEFAULT_BRANDING.colorPrimaryFg,
      DEFAULT_BRANDING.colorAccent,
      DEFAULT_BRANDING.tagline,
      DEFAULT_BRANDING.appStoreName,
      DEFAULT_BRANDING.notificationSender,
      DEFAULT_BRANDING.invoiceBranding,
      DEFAULT_BRANDING.customerBranding,
      DEFAULT_BRANDING.restaurantBranding,
      DEFAULT_BRANDING.riderBranding,
      DEFAULT_BRANDING.adminBranding,
      DEFAULT_BRANDING.legalCompanyName,
      DEFAULT_BRANDING.supportEmail,
      DEFAULT_BRANDING.supportPhone,
    ],
  );

  for (const key of FEATURE_FLAG_KEYS) {
    const on = [
      "cod",
      "delivery_otp",
      "live_tracking",
      "push",
      "loyalty",
      "whatsapp",
    ].includes(key);
    await exec(
      `insert into feature_flags (id, org_id, key, state, rollout_pct, notes)
       values ($1,$2,$3,$4,$5,$6) on conflict (id) do nothing`,
      [
        `ff_${key}`,
        DEFAULT_ORG_ID,
        key,
        on ? "ON" : "OFF",
        on ? 100 : 0,
        "Central flag — business logic reads this, not hardcoded UI.",
      ],
    );
  }

  await exec(
    `insert into platform_settings (org_id, settings_json)
     values ($1,$2) on conflict (org_id) do nothing`,
    [DEFAULT_ORG_ID, JSON.stringify(DEFAULT_SETTINGS)],
  );

  const alerts: [string, string, string][] = [
    ["HIGH", "rider_shortage", "Rider coverage thin in Longai Road after 8pm"],
    ["CRITICAL", "delayed_orders", "4 orders past promised time in Station Road"],
    ["MEDIUM", "restaurant_downtime", "Green Leaf Veg Kitchen paused by operator"],
    ["HIGH", "refund_spike", "Refund rate above 8% in the last 3 hours (SIMULATED)"],
    ["LOW", "payment_failures", "2 UPI authorizations pending confirmation"],
    ["INFORMATION", "seed", "Marketplace seed loaded. All figures are SIMULATED until Window 5 connects."],
  ];
  for (let i = 0; i < alerts.length; i++) {
    const a = alerts[i]!;
    await exec(
      `insert into alerts (id, org_id, severity, kind, title, body, status, city_id)
       values ($1,$2,$3,$4,$5,$6,'OPEN','city_karimganj') on conflict (id) do nothing`,
      [`al_${pad(i + 1)}`, DEFAULT_ORG_ID, a[0], a[1], a[2], a[2]],
    );
  }

  await exec(
    `insert into risk_signals (id, org_id, subject_type, subject_id, signal_key, score, status, summary)
     values
     ('risk_001',$1,'customer','cus_007','repeat_refunds',72,'OPEN','Repeated refunds on COD orders. Signal only — do not auto-punish.'),
     ('risk_002',$1,'customer','cus_019','coupon_abuse',64,'OPEN','Multiple first-order coupons from related devices (SIMULATED).'),
     ('risk_003',$1,'rider','rdr_011','cod_anomaly',58,'OPEN','Cash collected vs app COD mismatch ₹120.')
     on conflict (id) do nothing`,
    [DEFAULT_ORG_ID],
  );

  await exec(
    `insert into notifications (id, org_id, channel, template_key, audience, status, provider, provider_confirmed)
     values
     ('nt_001',$1,'push','order_delayed','customer','queued','ADAPTER',0),
     ('nt_002',$1,'sms','otp_delivery','customer','sent','ADAPTER',0),
     ('nt_003',$1,'whatsapp','restaurant_sla','restaurant','failed','ADAPTER',0)
     on conflict (id) do nothing`,
    [DEFAULT_ORG_ID],
  );
}

async function seedV2(): Promise<void> {
  await exec(`create table if not exists dispatch_requests (
      id text primary key,
      org_id text not null,
      order_id text not null,
      requested_rider_id text,
      status text not null default 'REQUESTED',
      reason text,
      created_by_employee_id text,
      created_at timestamptz not null default now()
    )`);
  await exec(`create table if not exists marketing_campaigns (
      id text primary key,
      org_id text not null,
      name text not null,
      channel text not null,
      status text not null default 'DRAFT',
      audience text not null default 'customers',
      budget_paise int not null default 0,
      spent_paise int not null default 0,
      starts_at timestamptz,
      ends_at timestamptz,
      notes text,
      created_at timestamptz not null default now()
    )`);
  await exec(`create table if not exists settlement_batches (
      id text primary key,
      org_id text not null,
      party_type text not null,
      party_id text not null,
      party_name text not null,
      payable_paise int not null,
      status text not null default 'READY',
      approved_by text,
      approved_at timestamptz,
      reason text,
      created_at timestamptz not null default now()
    )`);
  await exec(`create table if not exists idempotency_keys (
      key text primary key,
      org_id text not null,
      employee_id text,
      action text not null,
      response_json text not null,
      created_at timestamptz not null default now()
    )`);
  const sql = await getSql();
  const rand = rng(20260902);
  const now = Date.now();
  const silcharRsts = [
    { id: "rst_s001", zoneId: "zone_silchar" },
    { id: "rst_s002", zoneId: "zone_silchar" },
    { id: "rst_s003", zoneId: "zone_silchar" },
  ];
  const menuRows = await sql<{ id: string; restaurant_id: string; name: string; price_paise: number }>`
    select id, restaurant_id, name, price_paise from menu_items where restaurant_id like 'rst_s%'
  `;
  const menuCache = new Map<string, { id: string; name: string; price_paise: number }[]>();
  for (const row of menuRows) {
    const list = menuCache.get(row.restaurant_id) ?? [];
    list.push(row);
    menuCache.set(row.restaurant_id, list);
  }
  const flow: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "RIDER_ASSIGNED",
    "DELIVERED",
    "DELIVERED",
    "CANCELLED",
  ];
  for (let i = 1; i <= 24; i++) {
    const rst = silcharRsts[(i - 1) % silcharRsts.length]!;
    const status = flow[(i - 1) % flow.length]!;
    const placed = new Date(now - rand() * 8 * 3600_000);
    const promised = new Date(placed.getTime() + 35 * 60_000);
    const items = (menuCache.get(rst.id) ?? []).slice(0, 2);
    const food = items.reduce((s, it) => s + it.price_paise, 0) || 22000;
    const eco = calculateOrderEconomics({
      foodPaise: food,
      restaurantDiscountPaise: 0,
      platformDiscountPaise: 0,
      deliveryFeePaise: 3500,
      serviceFeePaise: DEFAULT_SETTINGS.serviceFeePaise,
      taxPaise: Math.round(food * 0.025),
      commissionBps: DEFAULT_SETTINGS.commissionBps,
      paymentFeeBps: DEFAULT_SETTINGS.paymentFeeBps,
      riderBasePaise: DEFAULT_SETTINGS.riderBasePaise,
      riderDistancePaise: DEFAULT_SETTINGS.riderDistancePaise,
      riderIncentivePaise: 0,
      cashCollectedPaise: 0,
    });
    const needsRider = ["RIDER_ASSIGNED", "DELIVERED"].includes(status);
    await exec(
      `insert into orders (
        id, org_id, city_id, zone_id, restaurant_id, customer_id, rider_id, status,
        payment_status, payment_method, food_paise, restaurant_discount_paise, platform_discount_paise,
        delivery_fee_paise, service_fee_paise, tax_paise, total_paise, commission_paise,
        payment_fee_paise, rider_payout_paise, refund_paise, promised_at, placed_at,
        confirmed_at, delivered_at, data_mode
      ) values (
        $1,$2,'city_silchar',$3,$4,$5,$6,$7,'PAID','UPI',$8,0,0,3500,$9,$10,$11,$12,$13,$14,0,$15,$16,$17,$18,'SIMULATED'
      ) on conflict (id) do nothing`,
      [
        `ROS-SIL-${pad(i, 4)}`,
        DEFAULT_ORG_ID,
        rst.zoneId,
        rst.id,
        `cus_${pad(44 + ((i - 1) % 4) + 1)}`,
        needsRider ? `rdr_${pad(29 + ((i - 1) % 4))}` : null,
        status,
        food,
        DEFAULT_SETTINGS.serviceFeePaise,
        Math.round(food * 0.025),
        eco.customerTotalPaise,
        eco.commissionPaise,
        eco.paymentFeePaise,
        eco.riderPayablePaise,
        promised.toISOString(),
        placed.toISOString(),
        status === "PENDING" ? null : new Date(placed.getTime() + 4 * 60_000).toISOString(),
        status === "DELIVERED" ? new Date(placed.getTime() + 40 * 60_000).toISOString() : null,
      ],
    );
  }

  await exec(
    `update kyc_cases set document_refs_json = $1
     where subject_type='restaurant' and document_refs_json = '[]'`,
    [
      JSON.stringify([
        { label: "FSSAI / trade license", ref: "doc_license" },
        { label: "Owner ID (masked)", ref: "doc_id" },
      ]),
    ],
  );
  await exec(
    `update kyc_cases set document_refs_json = $1 where subject_type='rider' and document_refs_json = '[]'`,
    [
      JSON.stringify([
        { label: "Driving licence (masked)", ref: "doc_dl" },
        { label: "Photo", ref: "doc_photo" },
      ]),
    ],
  );

  const campaigns = [
    ["cmp_launch", "Karimganj launch week", "push", "customers", 250000],
    ["cmp_ramadan", "Ramadan restaurant hours", "whatsapp", "restaurants", 80000],
    ["cmp_rider", "Night shift rider bonus (copy only)", "sms", "riders", 120000],
  ] as const;
  for (const c of campaigns) {
    await exec(
      `insert into marketing_campaigns (id, org_id, name, channel, audience, budget_paise, spent_paise, status, notes)
       values ($1,$2,$3,$4,$5,$6,0,'DRAFT',$7) on conflict (id) do nothing`,
      [c[0], DEFAULT_ORG_ID, c[1], c[2], c[3], c[4], "ESTIMATE — not a live spend"],
    );
  }

  const rstSettlements = await sql<{ restaurant_id: string; name: string; settlement: number }>`
    select o.restaurant_id, r.name,
           coalesce(sum(o.food_paise - o.restaurant_discount_paise - o.commission_paise + o.platform_discount_paise),0)::int as settlement
    from orders o join restaurants r on r.id=o.restaurant_id
    where o.org_id = ${DEFAULT_ORG_ID} and o.status='DELIVERED'
    group by o.restaurant_id, r.name
  `;
  for (const row of rstSettlements.slice(0, 12)) {
    await exec(
      `insert into settlement_batches (id, org_id, party_type, party_id, party_name, payable_paise, status)
       values ($1,$2,'RESTAURANT',$3,$4,$5,'READY') on conflict (id) do nothing`,
      [`set_${row.restaurant_id}`, DEFAULT_ORG_ID, row.restaurant_id, row.name, row.settlement],
    );
  }
}
