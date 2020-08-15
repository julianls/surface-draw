export class ViewControl {
  public scale = 1.0;
  public offsetX = 0.0;
  public offsetY = 0.0;
  public width = 0.0;
  public height = 0.0;
  public switch = false;

  public zoomIn(): void {
    this.scale /= 0.80;
  }

  public zoomOut(): void {
    this.scale *= 0.80;
  }

  public translateXPlus(): void {
    this.offsetX += 25;
  }

  public translateXMinus(): void {
    this.offsetX -= 25;
  }

  public translateYPlus(): void {
    this.offsetY += 25;
  }

  public translateYMinus(): void {
    this.offsetY -= 25;
  }

  public invalidate(): void {
    this.switch = !this.switch;
  }
}
