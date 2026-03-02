from app.model.config import Config
from app.model.trainer import Trainer
from app.model.display import Display


def main():
    config = Config()
    trainer = Trainer(config)
    display = Display()

    # Example flow
    trainer.create_dataset()
    trainer.apply_transforms()
    trainer.train_model()

    # Simulate an image input (replace with actual image)
    mock_image = "sample_image"
    before_img, after_img = display.identify_image(mock_image)
    print("Displaying images before and after processing:")
    print(f"Before: {before_img}")
    print(f"After: {after_img}")


if __name__ == '__main__':
    main()
