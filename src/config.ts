export abstract class Config {
  // public static mongoUrl = `mongodb://${process.env.mongo_host_name}/${process.env.mongo_db_name}?retryWrites=true&w=majority`;
  public static mongoUrl = `${process.env.mongo_whole_url}`;

}

