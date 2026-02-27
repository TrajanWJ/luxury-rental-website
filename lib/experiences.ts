export type ExperienceType = "dining" | "wellness" | "boating" | "entertainment" | "lifestyle" | "childcare";

export interface Experience {
    id: string;
    name: string;
    type: ExperienceType;
    description: string;
    details: string;
    contactName?: string;
    contactTitle?: string;
    phone?: string;
    email?: string;
    website?: string;
    serviceOffered?: string;
    imageUrl?: string;
    images?: string[];
}

export const experiences: Experience[] = [
    {
        id: "napoli-at-the-lake",
        name: "Napoli at the Lake",
        type: "dining",
        description: "Chef Brad and Melanie bring over 25 years of culinary excellence to Smith Mountain Lake, specializing in Certified Angus Beef and locally sourced seafood.",
        details: "Private chef services, bartending, and full-service catering for your lakefront retreat. From intimate dinners to large gatherings, enjoy restaurant-quality dining without leaving your property.",
        contactName: "Brad and Melanie Eames",
        contactTitle: "Chef and Owner",
        phone: "(540) 238-2142",
        email: "napolibythelake@gmail.com",
        website: "https://napolibythelakesml.com/",
        serviceOffered: "Private Chef, Bartending & Catering",
        imageUrl: "https://img1.wsimg.com/isteam/ip/6bf85f7d-6c61-49d4-a892-e18e4f131e93/IMG_4873.jpg"
    },
    {
        id: "lindas-catering",
        name: "Linda's Catering",
        type: "dining",
        description: "With roots in the culinary world since 1974, Linda specializes in Italian and Greek cuisine for parties of all sizes, up to 80 guests.",
        details: "From appetizer parties paired with fine wine to full multi-course dinners, Linda crafts custom menus tailored to your taste. Her Italian dishes are a guest favorite.",
        contactName: "Linda Blanchette",
        contactTitle: "Chef and Owner",
        phone: "(978) 618-2384",
        email: "lyndla@verizon.net",
        serviceOffered: "Catering",
        imageUrl: "/gourmet-kitchen-marble-countertops.jpg"
    },
    {
        id: "mt-fuji-hibachi",
        name: "Mt. Fuji Private Hibachi",
        type: "dining",
        description: "Bring the excitement of a live hibachi experience directly to your lakefront property â food, fire, and entertainment included.",
        details: "Our team handles everything so you can focus on the show. Choose from chicken, steak, shrimp, salmon, filet, ribeye, and scallops. Just tell us which Wilson Premier property you're staying at.",
        phone: "(757) 828-0147",
        email: "atinfo@fuji757.com",
        website: "https://www.mtfujiof757.com/",
        serviceOffered: "Private Hibachi Experience",
        imageUrl: "/rustic-dining-room-wooden-beams.jpg"
    },
    {
        id: "sml-fine-wines",
        name: "SML Fine Wines",
        type: "dining",
        description: "Curated wine tastings, private classes, and sommelier services across Southwest Virginia â Roanoke, Smith Mountain Lake, and Lynchburg.",
        details: "From private tastings and wine education to party planning and rental-home wine stocking, Ryan brings the vineyard experience to your door.",
        contactName: "Ryan McFeely",
        contactTitle: "Owner",
        phone: "(540) 855-1845",
        email: "ryan@smlfinewines.com",
        website: "https://www.smlfinewines.com/",
        serviceOffered: "Tastings, Sommelier Services, Party Planning, Wine Supplier",
        imageUrl: "https://image9.zibster.com/8584/29_20250616165519_8287004_xlarge.jpg"
    },
    {
        id: "mountain-view-farm",
        name: "Mountain View Farm Wagyu",
        type: "dining",
        description: "Premium American Wagyu steaks and burgers delivered and stocked at your property before arrival.",
        details: "100% USDA inspected natural beef, hand-selected for exceptional marbling and tenderness. Mix and match or double up to customize your perfect lakeside cookout.",
        contactName: "Bennett Fulper",
        contactTitle: "Owner",
        phone: "(434) 203-9297",
        email: "bfulper@cobbblestonemilk.com",
        website: "https://www.mvfpremierbeef.com/",
        serviceOffered: "Wagyu Beef & Steaks Supplier",
        imageUrl: "/wagyu-beef-1.jpg",
        images: ["/wagyu-beef-1.jpg", "/wagyu-beef-2.jpg", "/wagyu-beef-3.jpg"]
    },
    {
        id: "traveling-therapy",
        name: "Traveling Therapy Spa",
        type: "wellness",
        description: "Elizabeth has been bringing pain relief and relaxation to homes for over 30 years, specializing in hand-tailored massage therapy.",
        details: "Specialties include Myofascial Release, Deep Tissue Massage, Manual Lymphatic Drainage, Hawaiian Lomi Lomi, and full wellness treatments. Book 6-8 weeks in advance due to high demand.",
        contactName: "Elizabeth Doucette",
        contactTitle: "Owner",
        phone: "(540) 492-0855",
        website: "https://travelingtherapy.ncbcertified.com/",
        serviceOffered: "In-House Massage Therapist & Spa",
        imageUrl: "https://travelingtherapy.ncbcertified.com/images/sites/756/1831.jpg"
    },
    {
        id: "goodhue-boat-company",
        name: "Goodhue Boat Company",
        type: "boating",
        description: "Premium boat rentals delivered directly to your dock with full training, so you can hit the water from the moment you arrive.",
        details: "Goodhue delivers the boat, conducts all necessary safety training, and retrieves it at the end of your stay. Hassle-free lake access for your entire trip.",
        contactName: "Cody Gray",
        contactTitle: "Owner",
        phone: "(603) 707-9287",
        email: "Codyg@goodhueboat.com",
        website: "https://www.goodhueboat.com/",
        serviceOffered: "Boat Rentals & Delivery",
        imageUrl: "https://goodhueboat.com/wp-content/uploads/2025/09/CS22ii_5705-900x604.jpg"
    },
    {
        id: "virginia-dare-cruises",
        name: "Virginia Dare Cruises",
        type: "boating",
        description: "Private sightseeing, specialty, and wedding cruises aboard a grand riverboat paddlewheel-style vessel.",
        details: "Perfect for large groups looking for a unique on-water experience. From scenic tours to full wedding celebrations, the Virginia Dare offers an unforgettable ride.",
        contactName: "Victor Clark",
        contactTitle: "Captain",
        phone: "(540) 297-7100",
        email: "victor@bebetterdomore.com",
        website: "https://www.vadaresml.com/virginia-dare",
        serviceOffered: "Charter Boat Services & Boat Tours",
        imageUrl: "https://static.wixstatic.com/media/41b7d8_0796712dc079410b96272d4cf7c015f4~mv2.jpg"
    },
    {
        id: "captain-vic-sea-ray",
        name: "Captain Vic Sea Ray Services",
        type: "boating",
        description: "See the breathtaking beauty of Smith Mountain Lake from a unique perspective as you cruise along its pristine waters.",
        details: "Private chartered cruises with Captain Vic, offering personalized sightseeing tours of the lake's most scenic spots.",
        contactName: "Victor Clark",
        contactTitle: "Charter Captain",
        phone: "(434) 610-4064",
        email: "victor@bebetterdomore.com",
        website: "https://www.facebook.com/CaptainVicServices/",
        serviceOffered: "Charter Boat Services & Boat Tours",
        imageUrl: "https://goodhueboat.com/wp-content/uploads/2025/09/CS23-2019_10926-copy-900x604.jpg"
    },
    {
        id: "patriot-fishing-charters",
        name: "Patriot Fishing Charters",
        type: "boating",
        description: "Veteran-owned striper fishing charter turning a passion for the water into an unforgettable experience for lake visitors.",
        details: "What began as an Army veteran's pastime has become one of SML's premier fishing experiences. Professional guided trips for locals and visitors alike.",
        contactName: "John Mathena",
        contactTitle: "Charter Captain",
        phone: "(304) 520-2100",
        website: "https://patriotfishingcharter.com/",
        serviceOffered: "Charter Fishing",
        imageUrl: "https://i0.wp.com/patriotfishingcharter.com/wp-content/uploads/2022/06/67735981800__42C33B21-2A24-41F2-B609-62CC7AD1832D-rotated.jpg"
    },
    {
        id: "charlotte-efoil",
        name: "CharlotteEfoil",
        type: "boating",
        description: "Exclusive electric hydrofoil adventures for individuals, families, and groups of up to 20+ riders — delivered directly to your dock.",
        details: "Turn an ordinary lake day into something unforgettable. With seasoned professional instruction and dedicated one-on-one coaching, beginners quickly gain confidence and experience the thrill of flying above the water. High energy, safe instruction, incredible memories.",
        contactName: "Daniel Gleason",
        contactTitle: "Founder & Lead Instructor",
        phone: "(704) 421-8778",
        website: "https://www.charlotteefoil.com/",
        serviceOffered: "Electric Hydrofoil Adventures",
        imageUrl: "https://static.wixstatic.com/media/ece71f_ab958efcd4ca4cb49539b94ec0dbdd88~mv2.jpg"
    },
    {
        id: "charlotte-efoil",
        name: "CharlotteEfoil",
        type: "boating",
        description: "Exclusive electric hydrofoil adventures for individuals, families, and groups of up to 20+ riders — delivered directly to your dock.",
        details: "Turn an ordinary lake day into something unforgettable. With seasoned professional instruction and dedicated one-on-one coaching, beginners quickly gain confidence and experience the thrill of flying above the water. High energy, safe instruction, incredible memories.",
        contactName: "Daniel Gleason",
        contactTitle: "Owner",
        phone: "(704) 421-8778",
        website: "https://www.charlotteefoil.com/",
        serviceOffered: "Electric Hydrofoil Experiences",
        imageUrl: "/boating-water-sports.png"
    },
    {
        id: "betty-ashton-harpist",
        name: "Betty Ashton Mayo",
        type: "entertainment",
        description: "A professional harpist who spent years performing at Nashville's Ryman Auditorium and the Country Music Hall of Fame.",
        details: "Bring elegant live harp music to your lakefront event, dinner party, or celebration. Betty Ashton's performances create an atmosphere of timeless sophistication.",
        contactName: "Betty Ashton",
        contactTitle: "Harpist",
        phone: "(615) 491-1815",
        email: "ba@bettyashton.com",
        website: "https://www.bettyashton.com/",
        serviceOffered: "Live Harp Music",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/5db0b55c9639c745906e3382/e52e3195-8328-481a-b127-e2371f190ec3/Betty+Ashton+Harp.jpeg"
    },
    {
        id: "shows-great-media",
        name: "Shows Great Media Group",
        type: "entertainment",
        description: "Southwest and Central Virginia's premier media group capturing high-quality images and video.",
        details: "Professional photography and videography for your lakefront event, family reunion, or special occasion. Capturing your Smith Mountain Lake memories in stunning detail.",
        contactName: "Wanda Richards",
        contactTitle: "Photographer, Videographer, Content Creator",
        phone: "(540) 520-6434",
        email: "showsgreatmedia@gmail.com",
        website: "https://showsgreat.photography/",
        serviceOffered: "Photography & Videography",
        imageUrl: "https://media.hd.pics/2/2egnsckxec.jpg"
    },
    {
        id: "personal-assistant",
        name: "Personal Assistant Service",
        type: "lifestyle",
        description: "Wilson Premier Properties offers a dedicated personal assistant to help facilitate your every need during your stay.",
        details: "From grocery runs to reservation coordination, your personal assistant is available upon request to ensure your lakefront vacation is completely effortless.",
        contactName: "",
        contactTitle: "Personal Assistant",
        phone: "(703) 930-6999",
        serviceOffered: "Personal Assistant Service",
        imageUrl: "/contemporary-lake-house-boat-dock.jpg"
    },
    {
        id: "at-your-service-concierge",
        name: "At Your Service Concierge",
        type: "lifestyle",
        description: "Carol has lived at Smith Mountain Lake full time since 2010, bringing extensive experience in guest services and community support.",
        details: "Personal concierge and driver services to make your stay seamless. Whether you need transportation, local recommendations, or help planning your itinerary.",
        contactName: "Carol Craighead",
        contactTitle: "Owner",
        phone: "(540) 314-2856",
        email: "atyourservicepc@gmail.com",
        website: "https://atyourservicepc.com/",
        serviceOffered: "Concierge & Driver",
        imageUrl: "http://atyourservicepc.com/wp-content/uploads/2020/08/cottage-1550083_1280.jpg"
    },
    {
        id: "acti-kare-childcare",
        name: "Acti-Kare In-Home Childcare",
        type: "childcare",
        description: "Tier-one in-home childcare and babysitting services with trained, background-checked, and insured caregivers.",
        details: "Enjoy a parents' night out or a quiet morning on the lake knowing your children are in trusted, professional hands right at your rental property.",
        phone: "(540) 443-6223",
        website: "https://actikare.com/roanoke/home-care-services/family-care/in-home-child-care/",
        serviceOffered: "In-Home Childcare Services",
        imageUrl: "/family-reunions.png"
    },
    {
        id: "wilson-premier-real-estate",
        name: "Wilson Premier Real Estate",
        type: "lifestyle",
        description: "Thought of having your own place at the lake? The owner of Wilson Premier Properties is also a licensed Real Estate Agent.",
        details: "Craig Wilson can help you find your dream home at Smith Mountain Lake. From waterfront estates to cozy cabins, turn your vacation into a permanent address.",
        contactName: "Craig Wilson",
        contactTitle: "CEO & Founder",
        phone: "(703) 930-6999",
        email: "craig@wilson-premier.com",
        website: "https://smllakefront.com/",
        serviceOffered: "Real Estate Services",
        imageUrl: "https://smllakefront.com/wp-content/uploads/2024/01/sml-aerial.jpg"
    }
];
