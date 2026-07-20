export const SITE_CONTACT = {
  brandName: 'Royace Lighting',
  companyName: 'Royace Lighting',
  gstNumber: 'Available on GST invoice',
  email: 'inquiry@royace.in',
  phone: '+91 98916 19199',
  phoneHref: 'tel:+919891619199',
  registeredAddress: 'Royace Lighting, 2/25 Main Road, Kirti Nagar, Near Police Station, New Delhi',
  supportTimings: 'Monday to Saturday, 10:00 AM to 7:00 PM IST',
  instagramUrl: 'https://www.instagram.com/royace.lighting?igsh=MTBjZXhtcHZta3dpNw==',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Royace%20Lighting%202%2F25%20Main%20Road%20Kirti%20Nagar%20Near%20Police%20Station%20New%20Delhi',
};

export const mailTo = (subject: string) =>
  `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(subject)}`;
