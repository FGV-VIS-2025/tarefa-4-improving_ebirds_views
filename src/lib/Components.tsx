export type MultiSelectProps = {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label?: string;
  };

export type ReportBirds = {
  speciesCode: string,
  comName: string,
  sciName: string,
  locId: string,
  locName: string,
  obsDt: string,
  howMany: number,
  lat: number,
  lng: number,
  obsValid: boolean,
  obsReviewed: boolean,
  locationPrivate: boolean,
  subId: string
};

export type BirdData = {
    comName: string;
    locName: string;
    howMany: number;
    lat: number;
    lng: number;
    // dateStart: Date;
    // dateEnd: Date;
    seasonName: string;
  };