---
title: Creative Presentations Directory
layout: page
templateEngineOverride: njk
description: "Directory matching Creative Presentations with presenters and Work Adventure room numbers."
---

{% set creativeDirectory = [
	{
		title: "Digital Gleaning: Agnès Varda and the Relationship of the Digital Humanities to Industry",
		presenters: "Nick Szydlowski",
		room: "Wagon 01",
		zone: "Caravan Camp"
		
	},
	{
		title: "Network mapping of the Epstein Files: applying DH methods to contemporary legal documents",
		presenters: "Yiwei Wang",
		room: "Wagon 02",
		zone: "Caravan Camp"
		
	},
	{
		title: "E-mergency of Memory: Archiving Grief in the Age of Platform Precarity",
		presenters: "Simanta Nandi",
		room: "Wagon 03",
		zone: "Caravan Camp"
		
	},
	{
		title: "Bimodal Network Graphs of Crowdfunded Literary Patronage: Two Views of Black Britons Publishing in the Eighteenth Century",
		presenters: "Lawrence Evalyn",
		room: "Wagon 04",
		zone: "Caravan Camp"
		
	},
	{
		title: "Sampling for Black Life",
		presenters: "Allie Martin",
		room: "Wagon 05",
		zone: "Caravan Camp"
		
	},
	{
		title: "Community-Centered Cumbia Digital Archive",
		presenters: "Gary Alfonso Huertas Garay",
		room: "Wagon 06",
		zone: "Caravan Camp"
		
	},
	{
		title: "Resolving Legal Challenges with Crowdsourced Community Archives",
		presenters: "Agnes Gambill West",
		room: "Wagon 07",
		zone: "Caravan Camp"
		
	},
	{
		title: "Crossing Borders, Policing Bodies: Reading Greene Through Digital Humanities and Modern U.S. Repression",
		presenters: "Rich Miller",
		room: "Wagon 08",
		zone: "Caravan Camp"
		
	},
	{
		title: "Interwoven Existence",
		presenters: "Andrew O'Dowd, Isadora Petrauskas, Zhonghao Chen",
		room: "Wagon 09",
		zone: "Caravan Camp"
		
	},
	{
		title: "From narrative data to lived experience: Embodying and navigating the care journey",
		presenters: "Livia Clarete",
		room: "Wagon 10",
		zone: "Caravan Camp"
		
	},
	{
		title: "History Through Exploration: Periphery Passive Engagement in Historical Video Games",
		presenters: "Tyler Gillis",
		room: "Wagon 11",
		zone: "Caravan Camp"
		
	},
	{
		title: "Feels Like Power: Excavating Militarized Spaces with Immersive Panoramic Poetry",
		presenters: "Collier Nogues",
		room: "Wagon 12",
		zone: "Caravan Camp"
		
	},
	{
		title: "Pssst ... are you a woman exploring a career in stem?",
		presenters: "Erin McCabe",
		room: "Wagon 13",
		zone: "Caravan Camp"
		
	},
	{
		title: "Tender Tokens: Jumpstarting Undergraduate Computational Hermeneutics",
		presenters: "Liz Rodrigues, Alex Bond, Xie Haotong, Sheilla Muligande, Ella Tobben",
		room: "Wagon 14",
		zone: "Caravan Camp"
		
	},
	{
		title: "A Nameless Man Came Among Us: Stylometric Inquiries for Authorship in Luther Blissett's Q",
		presenters: "Aurora Alagni",
		room: "Wagon 15",
		zone: "Caravan Camp"
		
	},
	{
		title: "Dimensions Colliding: We Asked for a Third Space and All We Got Was This AI-Generated T-Shirt",
		presenters: "Arianna Orr, Elizabeth Grumbach",
		room: "Wagon 16",
		zone: "Caravan Camp"
		
	},
	{
		title: "A Digital Humanities Approach to Enhancing Undergraduate Students' AI Literacy",
		presenters: "Tianyi Kou-Herrema",
		room: "Wagon 17",
		zone: "Caravan Camp"
		
	},
	{
		title: "Digital Humanities and Liberatory Friendship: An Anti-Management Manifesto",
		presenters: "Liz Grumbach, Pamella R. Lach",
		room: "Wagon 18",
		zone: "Caravan Camp"
		
	},
	{
		title: "#DHmakes Show-and-Tell Picnic",
		presenters: "Quinn Daedal, Amanda Visconti, Sara Arribas-Colmenar, Jajwalya Karajgikar",
		room: "Wagon 19",
		zone: "Caravan Camp"
		
	}
] %}



<section aria-labelledby="directory-cards-title">
	
	<div class="sp-card-grid">
		{% for item in creativeDirectory %}
		<article class="sp-card" aria-label="{{ item.title }} in {{ item.room }}">
			<p class="sp-room-badge">{{ item.room }}</p>
			<h4>{{ item.title }}</h4>
			<p class="sp-meta"><strong>Presenter:</strong> {{ item.presenters }}</p>
			
		</article>
		{% endfor %}
	</div>
</section>


<style>
	.solarpunk-hero {
		position: relative;
		overflow: hidden;
		padding: 2.2rem 1.4rem;
		border-radius: 16px;
		border: 1px solid rgba(28, 24, 50, 0.2);
		background:
			radial-gradient(circle at 10% 20%, rgba(246, 197, 0, 0.22), transparent 34%),
			radial-gradient(circle at 88% 78%, rgba(103, 132, 139, 0.25), transparent 40%),
			linear-gradient(130deg, rgba(255, 255, 255, 0.95), rgba(241, 247, 247, 0.96) 45%, rgba(252, 249, 236, 0.96));
		box-shadow: 0 14px 34px rgba(28, 24, 50, 0.11);
		margin-bottom: 1.5rem;
	}

	.sp-grid-overlay {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(28, 24, 50, 0.06) 1px, transparent 1px),
			linear-gradient(90deg, rgba(28, 24, 50, 0.06) 1px, transparent 1px);
		background-size: 24px 24px;
		opacity: 0.3;
		pointer-events: none;
	}

	.sp-glow {
		position: absolute;
		width: 220px;
		height: 220px;
		border-radius: 50%;
		filter: blur(36px);
		pointer-events: none;
	}

	.sp-glow--left {
		left: -70px;
		top: -80px;
		background: rgba(80, 160, 120, 0.28);
		animation: sp-float-left 10s ease-in-out infinite;
	}

	.sp-glow--right {
		right: -65px;
		bottom: -90px;
		background: rgba(246, 197, 0, 0.24);
		animation: sp-float-right 12s ease-in-out infinite;
	}

	.sp-hero-content {
		position: relative;
		z-index: 2;
	}

	.sp-kicker {
		margin: 0 0 0.45rem;
		color: #1C1832;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.sp-hero-content h2 {
		margin: 0 0 0.65rem;
		color: #0e1b4d;
		font-weight: 700;
		line-height: 1.2;
	}

	.sp-lede {
		margin: 0;
		color: #25314a;
		max-width: 64ch;
		line-height: 1.6;
	}

	.sp-notice {
		margin: 0 0 1.4rem;
		padding: 0.9rem 1rem;
		border-left: 4px solid #F6C500;
		background: rgba(246, 197, 0, 0.12);
		color: #25314a;
		border-radius: 8px;
	}

	.sp-section-head h3 {
		margin-top: 1.1rem;
		margin-bottom: 0.8rem;
		color: #0e1b4d;
		font-weight: 700;
	}

	.sp-card-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		margin-bottom: 1.2rem;
	}

	.sp-card {
		position: relative;
		padding: 1rem;
		border-radius: 12px;
		border: 1px solid rgba(28, 24, 50, 0.16);
		background: linear-gradient(165deg, #ffffff, #f3f7f7);
		box-shadow: 0 8px 20px rgba(28, 24, 50, 0.08);
		transform: translateY(12px);
		opacity: 0;
		animation: sp-reveal 0.65s ease forwards;
	}

	.sp-card:nth-child(2) { animation-delay: 0.08s; }
	.sp-card:nth-child(3) { animation-delay: 0.16s; }
	.sp-card:nth-child(4) { animation-delay: 0.24s; }
	.sp-card:nth-child(5) { animation-delay: 0.32s; }
	.sp-card:nth-child(6) { animation-delay: 0.40s; }

	.sp-room-badge {
		display: inline-block;
		margin: 0 0 0.65rem;
		padding: 0.22rem 0.6rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 700;
		color: #1C1832;
		background: rgba(246, 197, 0, 0.34);
	}

	.sp-card h4 {
		margin: 0 0 0.65rem;
		font-size: 1.02rem;
		line-height: 1.35;
		color: #0e1b4d;
	}

	.sp-meta {
		margin: 0.24rem 0;
		color: #31415f;
		font-size: 0.95rem;
	}

	.sp-table-wrap {
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgba(28, 24, 50, 0.14);
		box-shadow: 0 8px 20px rgba(28, 24, 50, 0.08);
	}

	.sp-table-wrap thead th {
		background: #1C1832;
		color: #fff;
		border-color: rgba(255, 255, 255, 0.15);
		white-space: nowrap;
	}

	.sp-room-pill {
		display: inline-block;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: rgba(103, 132, 139, 0.18);
		color: #1C1832;
		font-weight: 700;
		font-size: 0.85rem;
	}

	@keyframes sp-reveal {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes sp-float-left {
		0%, 100% { transform: translate(0, 0); }
		50% { transform: translate(12px, 8px); }
	}

	@keyframes sp-float-right {
		0%, 100% { transform: translate(0, 0); }
		50% { transform: translate(-10px, -6px); }
	}

	@media (max-width: 768px) {
		.solarpunk-hero {
			padding: 1.45rem 1rem;
			border-radius: 12px;
		}

		.sp-hero-content h2 {
			font-size: 1.35rem;
		}

		.sp-card {
			padding: 0.9rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sp-card,
		.sp-glow--left,
		.sp-glow--right {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>