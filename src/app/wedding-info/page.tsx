const weddingDetails = [
  {
    label: "Venue Location",
    title: "Brookside Chapel",
    description:
      "2251 Pesnell Ct\nMobile, AL 36695",
  },
  {
    label: "Estimated Start Time",
    title: "4:00 PM",
    description:
      "This will be from 4 to 10 p.m.",
  },
  {
    label: "Dress Code",
    title: "Black and Shades of Blue Attire",
    description:
      "Anything formal or semi-formal in black, navy, royal blue, light blue, or other shades of blue is encouraged. We will be indoors for the ceremony and photos but there are outside places available.",
  },
  {
    label: "Food",
    title: "Food details to be announced",
    description:
      "Add meal, dessert, drink, allergy, and dietary accommodation details here.",
  },
  {
    label: "Schedule",
    title: "Wedding day timeline",
    description:
      "Add the main events guests should know about, such as ceremony, photos, dinner, speeches, and send-off.",
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
        <p>
          Find wedding-day details here, including the venue location, estimated
          start time, dress code, food information, and other notes for guests.
        </p>
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
