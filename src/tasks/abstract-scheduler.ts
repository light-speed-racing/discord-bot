export abstract class AbstractScheduler {
  public abstract name: string;

  public abstract timeExpression: string;

  public abstract run();
}
