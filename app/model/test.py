from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from trainer import Trainer 
from display import Display as  display 
from config import Config as config
import torch


def main():
    print("""
    Option 1: Train Model
    Option 2: Test image
    Option 3: Quit
          """)
    trainer = Trainer()

    option = '1'
    while option != '3':
        if option == '1':
            print("Training")
            trainer.ValidateModel(trainer.test_loader)
            trainer.train_model()
            trainer.ValidateModel(trainer.test_loader)
            torch.save(trainer.model.state_dict(), "DenseNet121model_prototype.pth")
            print("Model saved")
        elif option == '2':
            print("Identifying images")
            images = display.identify_image(config)
        
        option = input("What would you like to do? >>> ") 


if __name__ == "__main__":
    main()

