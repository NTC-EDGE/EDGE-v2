import IImage from "./IImage";

interface IRole {
  key: string;
  slug: string;
  name: string;
}

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: Date;
  sex: string;
  nationality: string;
  role: IRole;
  profilePicture: IImage;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export default IUser;