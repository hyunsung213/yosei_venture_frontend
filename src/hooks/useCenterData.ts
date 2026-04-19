import centerData from "../../public/data.json";

export type OrganizationPerson = {
  name: string;
  role: string;
  ext: string;
};

export type CenterData = {
  greetings: {
    quote: string;
    paragraphs: string[];
    director: string;
    signatureText: string;
  };
  missionVision: {
    title: string;
    subtitle: string;
    cards: Array<{
      id: string;
      title: string;
      desc: string;
      iconName: string;
    }>;
  };
  history: Array<{
    year: string;
    milestones: string[];
  }>;
  organization: {
    manager: OrganizationPerson;
    staffs: OrganizationPerson[];
    support: OrganizationPerson;
  };
  addressInfo: {
    main_address: string;
    sub_address: string;
  };
  phone: string;
};

export function useCenterData() {
  // By statically importing the JSON, we bypass Next.js public folder caching issues 
  // and completely eliminate the "Loading..." UI flash.
  const data = centerData as CenterData;
  
  return { data, isLoading: false, error: null };
}
