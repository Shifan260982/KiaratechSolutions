const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const formatDate = (isoDate: string) => dateFormat.format(new Date(isoDate));
