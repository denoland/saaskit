const projects = [
  {
    id: 1,
    name: "Lookbook",
    description:
      "Share, Create, Inspire and Showcase design on the network for fashion. Upload your design here.",
    href: "https://fashionunited.com/lookbook",
    imageSrc:
      "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100",
    imageAlt: "Lookbook",
  },
  {
    id: 2,
    name: "News",
    description:
      "Find US and international fashion jobs and fashion news, including the latest trends and the business intelligence of the industry, on FashionUnited.",
    href: "https://fashionunited.com",
    imageSrc:
      "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100",
    imageAlt: "News",
  },
  {
    id: 3,
    name: "Jobboard",
    description:
      "Looking for the next step in your fashion career? Start your new professional life here.",
    href: "https://fashionunited.com/fashion-jobs",
    imageSrc:
      "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100",
    imageAlt: "Jobboard",
  },
  {
    id: 4,
    name: "Dashboard",
    description:
      "Where HR managers and recruiters can manage their job postings and company profile.",
    href: "https:/dashboard.fashionunited.com",
    imageSrc:
      "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100",
    imageAlt: "Dashboard",
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
              <div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
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
