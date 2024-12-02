import styles from './Footer.module.css';
import StepsToOpenAccount from './Organism/StepsToOpenAccount';



const Footer = () => {
    return (
        <>
            <div className={styles.ContainerWrapper}>
                <div className={styles.Container}>

                        <StepsToOpenAccount/>
                    

                </div>
            </div>
        </>
    )
}

export default Footer