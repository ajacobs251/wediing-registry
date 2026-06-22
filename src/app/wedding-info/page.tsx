const weddingDetails = [
  {
    label: "Day of the Wedding",
    title: "December 12, 2026",
    description:
      " ",
  },
  {
    label: "Estimated Start Time",
    title: "2:30 PM",
    description:
      " ",
  },
  {
    label: "Venue Location",
    title: "Brookside Chapel",
    description:
      "2251 Pesnell Ct\nMobile, AL 36695",
  },
  {
    label: "Dress Code",
    title: "Shades of Blue Attire",
    description:
      "Formal or semi-formal in navy, royal blue, light blue, or other shades of blue is encouraged. We will be indoors for the ceremony and photos but there are outside places available.",
  },
  {
    label: "Food",
    title: "Food details to be announced",
    description:
      "TBA",
  },
  {
    label: "Schedule",
    title: "Wedding day timeline",
    description:
      "TBA",
  },
  {
    label: "Questions",
    title: "Ask us anything",
    description:
      "Alex:\nPhone: (251) 422-9774\nEmail: addRus32@gmail.com\n\nMakenzie:\nPhone: (228) 697-6317\nEmail: mmdavis441@gmail.com",
  },
];

export default function WeddingInfoPage() {
  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Wedding Info</p>
        <h1>Everything guests need to know</h1>
      </section>

      <section className="wedding-info-list" aria-label="Wedding details">
        {weddingDetails.map((detail) => (
          <article className="wedding-info-list-item" key={detail.label}>
            <p className="eyebrow">{detail.label}</p>
            <h2>{detail.title}</h2>
            <p>{detail.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
