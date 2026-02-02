export type ExperienceType = "restaurant" | "activity" | "attraction" | "marina" | "rental" | "park" | "winery" | "history" | "dining" | "shopping";

export interface Experience {
    id: string;
    name: string;
    type: ExperienceType;
    lat: number;
    lng: number;
    description: string;
    details: string;
    address?: string;
    hours?: string;
    phone?: string;
    website?: string;
    imageUrl?: string;
}

export const experiences: Experience[] = [
    {
        id: "sml-state-park",
        name: "Smith Mountain Lake State Park",
        type: "park",
        lat: 37.1197,
        lng: -79.6027,
        description: "The lake's premier natural destination featuring a large public beach, miles of hiking trails, and prime spots for shoreline fishing.",
        details: "1,506-acre park with 16 miles of hiking trails, swimming beach, visitor center, and stunning lake views. Offers boat rentals, cabins, and camping.",
        address: "1235 State Park Rd, Huddleston, VA 24104",
        hours: "8am - Dusk",
        phone: "(540) 297-6066",
        imageUrl: "https://www.dcr.virginia.gov/state-parks/image/data/sml-beach-sunset.jpg"
    },
    {
        id: "bridgewater-plaza",
        name: "Bridgewater Plaza",
        type: "shopping",
        lat: 37.1578,
        lng: -79.6422,
        description: "The vibrant 'hub' of the lake. Home to mini-golf, rock climbing, arcades, and some of the best waterfront dining and shopping.",
        details: "The center of action at SML. Features Fun-N-Games Arcade, Harbortown Mini Golf, rock wall, various boutiques, and multiple restaurants.",
        address: "16430 Booker T Washington Hwy, Moneta, VA 24121",
        hours: "9am - 10pm",
        phone: "(540) 721-1639",
        imageUrl: "https://smith-mountain-lake.com/wp-content/uploads/2021/05/bridgewater-plaza-sml.jpg"
    },
    {
        id: "sml-dam-visitor-center",
        name: "SML Dam & Visitor Center",
        type: "attraction",
        lat: 37.0389,
        lng: -79.5397,
        description: "A must-see architectural marvel. Offers interactive exhibits on electricity generation and stunning panoramic views of the dam.",
        details: "Learn how the dam generates clean energy. Includes a scenic overlook, picnic area, and educational displays about the history of the lake.",
        address: "2072 Ford Rd, Sandy Level, VA 24161",
        hours: "9am - 5pm (Tue-Sat)",
        phone: "(540) 985-2587",
        imageUrl: "https://www.smithmountainlake.online/wp-content/uploads/2019/07/SML-Dam.jpg"
    },
    {
        id: "sml-jet-ski-rentals",
        name: "SML Jet Ski Rentals",
        type: "rental",
        lat: 37.1450,
        lng: -79.6300,
        description: "Experience the thrill of the open water with premium WaveRunner rentals.",
        details: "Rent the latest Yamaha WaveRunners by the hour or day. Safety equipment and brief instruction included. Reservations recommended.",
        address: "Bridgewater Plaza, Moneta, VA 24121",
        hours: "9am - 6pm Daily (May-Sept)",
        phone: "(540) 555-WAVE",
        website: "smljetski.com",
        imageUrl: "https://images.unsplash.com/photo-1545652925-af5f3964f63c?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "hickory-hill-vineyards",
        name: "Hickory Hill Vineyards",
        type: "winery",
        lat: 37.1800,
        lng: -79.6500,
        description: "A family-owned vineyard offering a peaceful atmosphere for wine tastings.",
        details: "Producing high-quality wines since 2001. Features a farmhouse tasting room, picnic area, and frequent live music events.",
        address: "1722 Hickory Cove Ln, Moneta, VA 24121",
        hours: "11am - 5pm (Wed-Sun)",
        phone: "(540) 296-1393",
        website: "hickoryhillvineyards.com",
        imageUrl: "https://smith-mountain-lake.com/wp-content/uploads/2020/06/hickory-hill-vineyards.jpg"
    },
    {
        id: "booker-t-washington-monument",
        name: "Booker T. Washington National Monument",
        type: "history",
        lat: 37.1221,
        lng: -79.7371,
        description: "Visit the birthplace of the influential educator. A living history farm glimpse into 19th-century life.",
        details: "Explore the life of Booker T. Washington through exhibits, films, and a reconstructed 1850s tobacco farm with living history demonstrations.",
        address: "12130 Booker T Washington Hwy, Hardy, VA 24101",
        hours: "9am - 5pm Daily",
        phone: "(540) 721-2094",
        imageUrl: "https://www.nps.gov/common/uploads/grid_builder/bowa/crop16_9/5D105D17-1DD8-B71B-0B86C90E2D64DA3D.jpg"
    },
    {
        id: "sml-farm-alpacas",
        name: "SML Farm Alpacas",
        type: "activity",
        lat: 37.1800,
        lng: -79.7000,
        description: "An interactive farm experience where you can meet, feed, and learn about friendly alpacas.",
        details: "Educational tours allow you to get up close with the herd. On-site shop features premium alpaca wool products.",
        address: "Call for directions, Hardy, VA",
        hours: "Tours by Appt",
        phone: "(540) 719-0281",
        imageUrl: "https://smithmountainlakefarm.com/wp-content/uploads/2018/06/alpaca-tours-sml.jpg"
    },
    {
        id: "homestead-creamery",
        name: "Homestead Creamery",
        type: "dining",
        lat: 37.1257,
        lng: -79.8828,
        description: "Legendary local dairy known for high-quality glass-bottled milk and rich, creamy ice cream.",
        details: "Visit the farm market and sandwich shop. Famous for their ice cream flights and fresh dairy products distributed regionally.",
        address: "7254 Booker T Washington Hwy, Wirtz, VA 24184",
        hours: "11am - 6pm (Closed Sun)",
        phone: "(540) 721-2045",
        imageUrl: "https://homesteadcreameryinc.com/wp-content/uploads/2020/04/ice-cream-scoops.jpg"
    },
    {
        id: "mariners-landing-golf",
        name: "Mariners Landing Golf",
        type: "activity",
        lat: 37.1350,
        lng: -79.5600,
        description: "A championship golf course designed by Robert Trent Jones Sr. with beautiful lake glimpses.",
        details: "18-hole semi-private course open to the public. Features a clubhouse, grill, and pro shop. Challenges golfers of all skill levels.",
        address: "100 Clubhouse Dr, Huddleston, VA 24104",
        hours: "7am - 6pm",
        phone: "(540) 297-7888",
        imageUrl: "https://marinerslanding.com/wp-content/uploads/2021/04/golf-course-view.jpg"
    },
    {
        id: "bernards-landing",
        name: "Bernard's Landing Resort",
        type: "marina",
        lat: 37.0673,
        lng: -79.5888,
        description: "Luxury resort community with boat rentals and 'The Landing' restaurant.",
        details: "A 70-acre waterfront peninsula with panoramic views. Offers boat rentals, beach access, wellness center, and fine dining.",
        address: "775 Ashmeade Rd, Moneta, VA 24121",
        hours: "24/7",
        phone: "(540) 721-8870",
        imageUrl: "https://bernardslanding.com/wp-content/uploads/2019/05/bernards-view.jpg"
    },
    {
        id: "westlake-golf-club",
        name: "Westlake Golf & Country Club",
        type: "activity",
        lat: 37.1400,
        lng: -79.6900,
        description: "Meticulously maintained links-style course winding through hardwood forests.",
        details: "18 holes of great golf designed by Russell Breeden. Known for its tight fairways and fast greens.",
        address: "360 Chestnut Creek Dr, Hardy, VA 24101",
        hours: "8am - 6pm",
        phone: "(540) 721-4214",
        imageUrl: "https://westlakegc.com/wp-content/uploads/2018/03/westlake-hole-1.jpg"
    },
    {
        id: "sml-community-park",
        name: "SML Community Park",
        type: "park",
        lat: 37.1900,
        lng: -79.6400,
        description: "Peaceful 37-acre park offering a public beach, fishing pier, and scenic picnicking.",
        details: "Less crowded alternative to the State Park. Features a sandy beach (seasonal), playground, and hiking trails.",
        address: "1482 Parkway Ave, Moneta, VA 24121",
        hours: "Dawn - Dusk",
        phone: "(540) 483-9293",
        imageUrl: "https://smith-mountain-lake.com/wp-content/uploads/2020/06/community-park-sml.jpg"
    },
    {
        id: "ramulose-ridge-vineyards",
        name: "Ramulose Ridge Vineyards",
        type: "winery",
        lat: 37.1600,
        lng: -79.6000,
        description: "Enjoy spectacular mountain views while sipping estate-grown wines.",
        details: "Known for their Chambourcin and Chardonel. The patio offers some of the best mountain views in the area.",
        address: "3061 Hendricks Store Rd, Moneta, VA 24121",
        hours: "11am - 5pm",
        phone: "(540) 314-2696",
        imageUrl: "https://ramuloseridgevineyards.com/wp-content/uploads/2017/04/vineyard-view.jpg"
    },
    {
        id: "waterfront-restaurant",
        name: "The Waterfront Restaurant",
        type: "restaurant",
        lat: 37.1650,
        lng: -79.6380,
        description: "Fine dining at its best, featuring seasonally inspired menus and fresh seafood.",
        details: "Private country club dining open to the public. Famous for their Sunday brunch and seafood buffet events.",
        address: "22051 Virgil H Goode Hwy, Moneta, VA 24121",
        hours: "11am - 10pm",
        phone: "(540) 721-1234",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "portside-grill",
        name: "Portside Grill & Bar",
        type: "dining",
        lat: 37.1300,
        lng: -79.6100,
        description: "The quintessential lakeside 'dock and dine' experience. Casual fare and tropical drinks.",
        details: "Virginia's only Key West style bar & grill. Entirely outdoors/covered. Live music weekends.",
        address: "3619 Airport Rd, Moneta, VA 24121",
        hours: "11am - 10pm (Seasonal)",
        phone: "(540) 297-7100",
        imageUrl: "https://smith-mountain-lake.com/wp-content/uploads/2020/06/portside-grill-sml.jpg"
    },
    {
        id: "crazy-horse-marina",
        name: "Crazy Horse Marina",
        type: "marina",
        lat: 37.0500,
        lng: -79.6100,
        description: "Full-service marina with pontoon rentals and a popular seasonal restaurant.",
        details: "Home to Los Amigos Mexican restaurant. Large covered slips, gas dock, and ship store.",
        address: "400 Crazy Horse Dr, Moneta, VA 24121",
        hours: "9am - 6pm",
        phone: "(540) 719-0620",
        imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "harvester-center",
        name: "Harvester Performance Center",
        type: "activity",
        lat: 36.9946,
        lng: -79.8911,
        description: "State-of-the-art venue hosting world-class musical acts in an intimate setting.",
        details: "Renowned mid-sized music venue attracting major national touring acts. Great sightlines and acoustics.",
        address: "450 Franklin St, Rocky Mount, VA 24151",
        hours: "Show times vary",
        phone: "(540) 484-8277",
        imageUrl: "https://harvester-music.com/wp-content/uploads/2019/01/harvester-marquee.jpg"
    }
]
