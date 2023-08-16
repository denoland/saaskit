const projects = [
  {
    id: 1,
    name: "Lookbook",
    description:
      "Share, Create, Inspire and Showcase design on the network for fashion. Upload your design here.",
    href: "https://fashionunited.com/lookbook",
    imageSrc:
      "https://imagedelivery.net/7czaBv4WuiSsJFxi583jUw/1bf8b147-a46c-4116-42c8-af24b7dd6200/1280x720",
    imageAlt: "Lookbook",
  },
  {
    id: 2,
    name: "News",
    description:
      "Find US and international fashion jobs and fashion news, including the latest trends and the business intelligence of the industry, on FashionUnited.",
    href: "https://fashionunited.com",
    imageSrc:
      "https://imagedelivery.net/7czaBv4WuiSsJFxi583jUw/e8cd4b94-251b-4a01-ba3a-a0ed07de2000/1280x720",
    imageAlt: "News",
  },
  {
    id: 3,
    name: "Jobs",
    description:
      "Looking for the next step in your fashion career? Start your new professional life here.",
    href: "https://fashionunited.com/fashion-jobs",
    imageSrc:
      "https://imagedelivery.net/7czaBv4WuiSsJFxi583jUw/20b782dc-838c-4008-76ec-9a2156fc5700/1280x720",
    imageAlt: "Jobboard",
  },
  {
    id: 4,
    name: "Dashboard",
    description:
      "Where HR managers and recruiters can manage their job postings and company profile.",
    href: "https:/dashboard.fashionunited.com",
    imageSrc:
      "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&h=720&q=80&sat=-100",
    imageAlt: "Dashboard",
  },
  {
    id: 5,
    name: "Newsletters",
    description:
      "Over 250,000 people are already up-to-date with the latest developments in the industry",
    href: "https://fashionunited.com/newsletter/subscribe",
    imageSrc:
      "https://imagedelivery.net/7czaBv4WuiSsJFxi583jUw/b430b445-9ea9-4e35-cf0c-2c27e73ac700/1280x720",
    imageAlt: "Newsletters",
  },
  {
    id: 6,
    name: "Executive network",
    description:
      "Find the latest Fashion Trade news for Fashion Executives around the world. This platform provides the latest executive industry news and statistics.",
    href: "https://fashionunited.com/executive",
    imageSrc:
      "https://imagedelivery.net/7czaBv4WuiSsJFxi583jUw/281cad8f-2fac-4b3f-633d-92f7e6538100/1280x720",
    imageAlt: "Executive",
  },
  {
    id: 7,
    name: "Business Intelligence",
    description:
      "FashionUnited Business Intelligence provides apparel market data and analytics. It aims to provide the best available overview of the global fashion industry. Including the FashionUnited Top100, Facebook fashion index, Twitter fashion index, Fashion fortune 200, Retail statistics (monthly, Q, H, annual), commodity news, stock news, country statistics, company directory and more.",
    href: "https://fashionunited.com/i",
    imageSrc:
      "https://imagedelivery.net/7czaBv4WuiSsJFxi583jUw/e9a9322b-4f13-4ae4-1a1e-2b7207de7300/1280x720",
    imageAlt: "Business Intelligence",
  },
  {
    id: 8,
    name: "Events",
    description:
      "Listing of the upcoming fashion industry events such as fashion weeks, trade shows and fairs, for fashion business professionals.",
    href: "https://fashionunited.com/events",
    imageSrc:
      "https://imagedelivery.net/7czaBv4WuiSsJFxi583jUw/9ae62c50-faca-4294-174e-01bbe3ead000/1280x720",
    imageAlt: "Events",
  },
];

// https://tailwindui.com/components/ecommerce/components/product-lists

export default function Showcase() {
  return (
    <div className="bg-transparent">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Showcase of FashionUnited's products and services
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {projects.map((project) => (
            <div key={project.id} className="group relative">
              <div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800">
                <img
                  src={project.imageSrc}
                  alt={project.imageAlt}
                  className="object-cover object-center"
                />
                <div
                  className="flex items-end p-4 opacity-0 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <div className="w-full rounded-md bg-opacity-75 dark:bg-gray-800 px-4 py-2 text-center text-sm font-medium text-gray-900 dark:text-gray-50 backdrop-blur backdrop-filter">
                    View project
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between space-x-8 text-base font-medium text-gray-900 dark:text-gray-50">
                <h3>
                  <a href={project.href}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {project.name}
                  </a>
                </h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
